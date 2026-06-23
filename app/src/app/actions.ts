"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, requireAdmin } from "@/lib/auth";
import {
  addQuestion,
  applyAiDraftToExam,
  createAttempt,
  createExam,
  createExamFromAiDraft,
  duplicateQuestionByPublicId,
  getAdminByEmail,
  getAttemptBundle,
  logAiGeneration,
  moveQuestionByPublicId,
  setExamStatus,
  submitAttempt,
  updateExamMeta,
  updateQuestion,
  verifyAdminPassword,
  deleteQuestionByPublicId,
} from "@/lib/db/queries";
import { generateExamDraftWithGemini } from "@/lib/gemini";
import type { DifficultyLevel, OptionKey } from "@/lib/types";
import { clampText, difficultyLevels, optionKeys } from "@/lib/utils";

function withMessage(path: string, key: "error" | "success", message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(message)}`;
}

function parseDifficultyLevel(value: string): DifficultyLevel | null {
  return difficultyLevels.includes(value as DifficultyLevel)
    ? (value as DifficultyLevel)
    : null;
}

function parseOptionKey(value: string): OptionKey {
  return optionKeys.includes(value as OptionKey) ? (value as OptionKey) : "A";
}

export type InlineActionResult = {
  ok: boolean;
  message: string;
};

export type NavigationActionResult = InlineActionResult & {
  redirectTo?: string;
};

function parseAiApplyMode(
  value: string,
  examPublicId: string,
): "create_new" | "replace" | "append" {
  if (!examPublicId) {
    return "create_new";
  }

  return value === "append" ? "append" : "replace";
}

function parseAiRequest(formData: FormData) {
  const examPublicId = clampText(formData.get("examPublicId"));

  return {
    examPublicId,
    applyMode: parseAiApplyMode(clampText(formData.get("applyMode")), examPublicId),
    title: clampText(formData.get("title")),
    topicPrompt: clampText(formData.get("topicPrompt")),
    difficultyLevel: parseDifficultyLevel(clampText(formData.get("difficultyLevel"))),
    mcqCount: Number(clampText(formData.get("mcqCount"), "0")),
    essayCount: Number(clampText(formData.get("essayCount"), "0")),
    outputLanguage: clampText(formData.get("outputLanguage"), "English"),
    studentContext: clampText(
      formData.get("studentContext"),
      "Indonesian private English student",
    ),
    extraInstructions: clampText(formData.get("extraInstructions")),
  };
}

async function runAiDraftGeneration(formData: FormData): Promise<NavigationActionResult> {
  const admin = await requireAdmin();
  const input = parseAiRequest(formData);

  if (!input.title || !input.topicPrompt || !input.difficultyLevel) {
    return {
      ok: false,
      message: "Judul, prompt materi, dan difficulty wajib diisi.",
    } satisfies NavigationActionResult;
  }

  if (input.mcqCount < 1 && input.essayCount < 1) {
    return {
      ok: false,
      message: "Beri minimal satu soal pilihan ganda atau essay.",
    } satisfies NavigationActionResult;
  }

  let redirectTo = "/admin/exams/new?mode=ai";

  try {
    const result = await generateExamDraftWithGemini({
      title: input.title,
      topicPrompt: input.topicPrompt,
      difficultyLevel: input.difficultyLevel,
      mcqCount: input.mcqCount,
      essayCount: input.essayCount,
      outputLanguage: input.outputLanguage,
      studentContext: input.studentContext,
      extraInstructions: input.extraInstructions,
    });

    let examPublicId: string;
    let examId: number;
    let successMessage: string;

    if (input.examPublicId) {
      const exam = await applyAiDraftToExam({
        examPublicId: input.examPublicId,
        prompt: input.topicPrompt,
        difficultyLevel: input.difficultyLevel,
        draft: result.draft,
        mode: input.applyMode === "append" ? "append" : "replace",
      });

      examPublicId = exam.publicId;
      examId = exam.id;
      successMessage =
        input.applyMode === "append"
          ? "Soal baru dari Gemini sudah ditambahkan ke draft."
          : "Draft berhasil diperbarui dengan hasil Gemini.";
    } else {
      const exam = await createExamFromAiDraft({
        teacherId: admin.id,
        title: input.title,
        prompt: input.topicPrompt,
        difficultyLevel: input.difficultyLevel,
        draft: result.draft,
      });

      examPublicId = exam.publicId;
      examId = exam.id;
      successMessage = "Draft dari Gemini sudah siap. Membuka editor...";
    }

    redirectTo = `/admin/exams/${examPublicId}/edit`;

    await logAiGeneration({
      examId,
      promptText: result.prompt,
      promptPayloadJson: JSON.stringify({
        title: input.title,
        topicPrompt: input.topicPrompt,
        difficultyLevel: input.difficultyLevel,
        mcqCount: input.mcqCount,
        essayCount: input.essayCount,
        outputLanguage: input.outputLanguage,
        studentContext: input.studentContext,
        extraInstructions: input.extraInstructions,
        applyMode: input.applyMode,
      }),
      modelName: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
      responseJson: result.rawResponse,
      status: "success",
    });

    revalidatePath("/admin/exams");
    revalidatePath(`/admin/exams/${examPublicId}`);
    revalidatePath(`/admin/exams/${examPublicId}/edit`);
    revalidatePath(`/admin/exams/${examPublicId}/preview`);

    return {
      ok: true,
      message: successMessage,
      redirectTo,
    } satisfies NavigationActionResult;
  } catch (error) {
    await logAiGeneration({
      promptText: input.topicPrompt,
      promptPayloadJson: JSON.stringify({
        title: input.title,
        topicPrompt: input.topicPrompt,
        difficultyLevel: input.difficultyLevel,
        mcqCount: input.mcqCount,
        essayCount: input.essayCount,
        outputLanguage: input.outputLanguage,
        studentContext: input.studentContext,
        extraInstructions: input.extraInstructions,
        applyMode: input.applyMode,
        examPublicId: input.examPublicId,
      }),
      modelName: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown AI error",
    });

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "AI generation gagal. Coba lagi sebentar.",
      redirectTo,
    } satisfies NavigationActionResult;
  }
}

export async function loginAction(formData: FormData) {
  const email = clampText(formData.get("email")).toLowerCase();
  const password = clampText(formData.get("password"));

  const admin = await getAdminByEmail(email);

  if (!admin || !verifyAdminPassword(admin.passwordHash, password)) {
    redirect(withMessage("/admin/login", "error", "Email atau password belum cocok."));
  }

  await createAdminSession(admin.publicId);
  redirect("/admin/exams");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createManualExamAction(formData: FormData) {
  const admin = await requireAdmin();
  const title = clampText(formData.get("title"));
  const instructions = clampText(formData.get("instructions"));
  const difficultyLevel = parseDifficultyLevel(clampText(formData.get("difficultyLevel")));

  if (!title) {
    redirect(withMessage("/admin/exams/new?mode=manual", "error", "Judul exam wajib diisi."));
  }

  const exam = await createExam({
    teacherId: admin.id,
    title,
    instructions,
    creationMode: "manual",
    difficultyLevel,
  });

  revalidatePath("/admin/exams");
  redirect(withMessage(`/admin/exams/${exam.publicId}/edit`, "success", "Draft manual siap diedit."));
}

export async function generateAiExamAction(formData: FormData) {
  const result = await runAiDraftGeneration(formData);

  if (!result.ok) {
    redirect(withMessage("/admin/exams/new?mode=ai", "error", result.message));
  }

  redirect(
    withMessage(
      result.redirectTo ?? "/admin/exams",
      "success",
      result.message,
    ),
  );
}

export async function generateAiExamClientAction(formData: FormData) {
  return runAiDraftGeneration(formData);
}

export async function saveExamMetaAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const title = clampText(formData.get("title"));
  const instructions = clampText(formData.get("instructions"));
  const difficultyLevel = parseDifficultyLevel(clampText(formData.get("difficultyLevel")));

  if (!examPublicId || !title) {
    return {
      ok: false,
      message: "Data exam belum lengkap.",
    } satisfies InlineActionResult;
  }

  await updateExamMeta({
    publicId: examPublicId,
    title,
    instructions,
    difficultyLevel,
  });

  revalidatePath("/admin/exams");
  revalidatePath(`/admin/exams/${examPublicId}`);
  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  return {
    ok: true,
    message: "Detail exam tersimpan.",
  } satisfies InlineActionResult;
}

export async function addMcqQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionText = clampText(formData.get("questionText"));

  if (!examPublicId || !questionText) {
    return {
      ok: false,
      message: "Soal pilihan ganda belum lengkap.",
    } satisfies InlineActionResult;
  }

  await addQuestion({
    examPublicId,
    type: "multiple_choice",
    questionText,
    teacherNotes: clampText(formData.get("teacherNotes")),
    correctAnswerKey: parseOptionKey(clampText(formData.get("correctAnswerKey"), "A")),
    options: {
      A: clampText(formData.get("optionA")),
      B: clampText(formData.get("optionB")),
      C: clampText(formData.get("optionC")),
      D: clampText(formData.get("optionD")),
    },
  });

  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Soal pilihan ganda ditambahkan.",
  } satisfies InlineActionResult;
}

export async function addEssayQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionText = clampText(formData.get("questionText"));

  if (!examPublicId || !questionText) {
    return {
      ok: false,
      message: "Soal essay belum lengkap.",
    } satisfies InlineActionResult;
  }

  await addQuestion({
    examPublicId,
    type: "essay",
    questionText,
    teacherNotes: clampText(formData.get("teacherNotes")),
  });

  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Soal essay ditambahkan.",
  } satisfies InlineActionResult;
}

export async function updateQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionPublicId = clampText(formData.get("questionPublicId"));
  const questionText = clampText(formData.get("questionText"));

  if (!examPublicId || !questionPublicId || !questionText) {
    return {
      ok: false,
      message: "Perubahan soal belum bisa diproses.",
    } satisfies InlineActionResult;
  }

  await updateQuestion({
    questionPublicId,
    questionText,
    teacherNotes: clampText(formData.get("teacherNotes")),
    correctAnswerKey: parseOptionKey(clampText(formData.get("correctAnswerKey"), "A")),
    options: {
      A: clampText(formData.get("optionA")),
      B: clampText(formData.get("optionB")),
      C: clampText(formData.get("optionC")),
      D: clampText(formData.get("optionD")),
    },
  });

  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Soal berhasil diupdate.",
  } satisfies InlineActionResult;
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionPublicId = clampText(formData.get("questionPublicId"));

  if (!examPublicId || !questionPublicId) {
    return {
      ok: false,
      message: "Penghapusan soal belum bisa diproses.",
    } satisfies InlineActionResult;
  }

  await deleteQuestionByPublicId(questionPublicId);
  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Soal dihapus dari draft.",
  } satisfies InlineActionResult;
}

export async function duplicateQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionPublicId = clampText(formData.get("questionPublicId"));

  if (!examPublicId || !questionPublicId) {
    return {
      ok: false,
      message: "Duplikasi soal belum bisa diproses.",
    } satisfies InlineActionResult;
  }

  await duplicateQuestionByPublicId({
    examPublicId,
    questionPublicId,
  });

  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Soal berhasil diduplikasi.",
  } satisfies InlineActionResult;
}

export async function moveQuestionAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  const questionPublicId = clampText(formData.get("questionPublicId"));
  const direction = clampText(formData.get("direction"));

  if (
    !examPublicId ||
    !questionPublicId ||
    (direction !== "up" && direction !== "down")
  ) {
    return {
      ok: false,
      message: "Perubahan urutan soal gagal dibaca.",
    } satisfies InlineActionResult;
  }

  await moveQuestionByPublicId({
    examPublicId,
    questionPublicId,
    direction,
  });

  revalidatePath(`/admin/exams/${examPublicId}/edit`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  return {
    ok: true,
    message: "Urutan soal diperbarui.",
  } satisfies InlineActionResult;
}

export async function publishExamAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));

  try {
    await setExamStatus(examPublicId, "published");
  } catch (error) {
    redirect(
      withMessage(
        `/admin/exams/${examPublicId}/edit`,
        "error",
        error instanceof Error ? error.message : "Publish gagal.",
      ),
    );
  }

  revalidatePath("/admin/exams");
  revalidatePath(`/admin/exams/${examPublicId}`);
  revalidatePath(`/admin/exams/${examPublicId}/preview`);
  redirect(withMessage(`/admin/exams/${examPublicId}`, "success", "Exam sudah dipublish."));
}

export async function closeExamAction(formData: FormData) {
  await requireAdmin();
  const examPublicId = clampText(formData.get("examPublicId"));
  await setExamStatus(examPublicId, "closed");
  revalidatePath("/admin/exams");
  revalidatePath(`/admin/exams/${examPublicId}`);
  redirect(withMessage(`/admin/exams/${examPublicId}`, "success", "Exam sudah ditutup."));
}

export async function startExamAttemptAction(formData: FormData) {
  const examSlug = clampText(formData.get("examSlug"));
  const studentName = clampText(formData.get("studentName"));

  if (!examSlug || !studentName) {
    redirect(withMessage(`/e/${examSlug}`, "error", "Nama murid wajib diisi dulu."));
  }

  let token: string;

  try {
    token = await createAttempt({ examSlug, studentName });
  } catch (error) {
    redirect(
      withMessage(
        `/e/${examSlug}`,
        "error",
        error instanceof Error ? error.message : "Gagal memulai exam.",
      ),
    );
  }

  redirect(`/e/${examSlug}/attempt/${token}`);
}

export async function submitExamAttemptAction(formData: FormData) {
  const result = await submitExamAttemptClientAction(formData);

  if (!result.ok) {
    const examSlug = clampText(formData.get("examSlug"));
    const attemptToken = clampText(formData.get("attemptToken"));

    redirect(
      withMessage(
        `/e/${examSlug}/attempt/${attemptToken}`,
        "error",
        result.message,
      ),
    );
  }

  redirect(result.redirectTo ?? "/");
}

export async function submitExamAttemptClientAction(formData: FormData) {
  const examSlug = clampText(formData.get("examSlug"));
  const attemptToken = clampText(formData.get("attemptToken"));
  const bundle = await getAttemptBundle({ examSlug, attemptToken });

  if (!bundle) {
    return {
      ok: false,
      message: "Attempt tidak ditemukan.",
    } satisfies NavigationActionResult;
  }

  const answersByQuestionPublicId = Object.fromEntries(
    bundle.questions.map((question) => [
      question.publicId,
      clampText(formData.get(`question_${question.publicId}`)),
    ]),
  );

  let studentName: string;

  try {
    const result = await submitAttempt({
      attemptToken,
      answersByQuestionPublicId,
    });

    studentName = result.studentName;
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Submit gagal.",
    } satisfies NavigationActionResult;
  }

  revalidatePath(`/admin/exams/${bundle.exam.publicId}/submissions`);

  return {
    ok: true,
    message: "Jawaban berhasil dikirim. Membuka halaman konfirmasi...",
    redirectTo: `/e/${examSlug}/submitted?name=${encodeURIComponent(studentName)}`,
  } satisfies NavigationActionResult;
}
