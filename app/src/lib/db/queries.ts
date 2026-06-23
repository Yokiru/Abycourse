import { and, desc, eq, inArray, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  adminUsers,
  aiGenerationLogs,
  examAttempts,
  exams,
  questionOptions,
  questions,
  submissionAnswers,
  submissions,
} from "./schema";
import { getDb } from "./index";
import type {
  AiGeneratedExam,
  CreationMode,
  DifficultyLevel,
  ExamListItem,
  ExamRecord,
  ExamStatus,
  OptionKey,
  QuestionRecord,
  QuestionType,
  SubmissionDetail,
  SubmissionListItem,
} from "../types";
import {
  createPublicId,
  nowIso,
  normalizeOptions,
  optionKeys,
  slugify,
} from "../utils";
import { executeMany, executeRead, executeRun } from "./executor";

function toExamRecord(row: typeof exams.$inferSelect): ExamRecord {
  return {
    id: row.id,
    publicId: row.publicId,
    teacherId: row.teacherId,
    title: row.title,
    instructions: row.instructions,
    creationMode: row.creationMode as CreationMode,
    difficultyLevel: (row.difficultyLevel as DifficultyLevel | null) ?? null,
    aiPrompt: row.aiPrompt,
    status: row.status as ExamStatus,
    publicSlug: row.publicSlug,
    publishedAt: row.publishedAt,
    closedAt: row.closedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toQuestionRecord(
  question: typeof questions.$inferSelect,
  options: Array<typeof questionOptions.$inferSelect>,
): QuestionRecord {
  return {
    id: question.id,
    publicId: question.publicId,
    examId: question.examId,
    type: question.type as QuestionType,
    questionText: question.questionText,
    orderIndex: question.orderIndex,
    correctAnswerKey: (question.correctAnswerKey as OptionKey | null) ?? null,
    teacherNotes: question.teacherNotes,
    options: optionKeys.map((key) => ({
      key,
      text: options.find((option) => option.optionKey === key)?.optionText ?? "",
    })),
  };
}

export async function getAdminByEmail(email: string) {
  const db = await getDb();
  return executeRead(db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email.toLowerCase()),
  }));
}

export async function getAdminByPublicId(publicId: string) {
  const db = await getDb();
  return executeRead(db.query.adminUsers.findFirst({
    where: eq(adminUsers.publicId, publicId),
  }));
}

export function verifyAdminPassword(
  passwordHash: string,
  plainPassword: string,
) {
  return bcrypt.compareSync(plainPassword, passwordHash);
}

export async function listExams(): Promise<ExamListItem[]> {
  const db = await getDb();
  const rows = await executeMany(
    db
    .select({
      id: exams.id,
      publicId: exams.publicId,
      teacherId: exams.teacherId,
      title: exams.title,
      instructions: exams.instructions,
      creationMode: exams.creationMode,
      difficultyLevel: exams.difficultyLevel,
      aiPrompt: exams.aiPrompt,
      status: exams.status,
      publicSlug: exams.publicSlug,
      publishedAt: exams.publishedAt,
      closedAt: exams.closedAt,
      createdAt: exams.createdAt,
      updatedAt: exams.updatedAt,
      questionCount: sql<number>`count(distinct ${questions.id})`,
      submissionCount: sql<number>`count(distinct ${submissions.id})`,
    })
    .from(exams)
    .leftJoin(questions, eq(questions.examId, exams.id))
    .leftJoin(submissions, eq(submissions.examId, exams.id))
    .groupBy(exams.id)
    .orderBy(desc(exams.createdAt)),
  );

  return rows.map((row) => ({
    ...toExamRecord(row),
    questionCount: Number(row.questionCount ?? 0),
    submissionCount: Number(row.submissionCount ?? 0),
  }));
}

export async function getExamByPublicId(examPublicId: string) {
  const db = await getDb();
  const row = await executeRead(db.query.exams.findFirst({
    where: eq(exams.publicId, examPublicId),
  }));

  return row ? toExamRecord(row) : null;
}

export async function getExamBySlug(slug: string) {
  const db = await getDb();
  const row = await executeRead(db.query.exams.findFirst({
    where: eq(exams.publicSlug, slug),
  }));

  return row ? toExamRecord(row) : null;
}

export async function listQuestionsForExam(examId: number): Promise<QuestionRecord[]> {
  const db = await getDb();
  const questionRows = await executeMany(db.query.questions.findMany({
    where: eq(questions.examId, examId),
    orderBy: (table, { asc }) => [asc(table.orderIndex)],
  }));

  if (questionRows.length === 0) {
    return [];
  }

  const optionRows = await executeMany(db.query.questionOptions.findMany({
    where: inArray(
      questionOptions.questionId,
      questionRows.map((question) => question.id),
    ),
  }));

  return questionRows.map((question) =>
    toQuestionRecord(
      question,
      optionRows.filter((option) => option.questionId === question.id),
    ),
  );
}

export async function getExamBundle(examPublicId: string) {
  const exam = await getExamByPublicId(examPublicId);

  if (!exam) {
    return null;
  }

  return {
    exam,
    questions: await listQuestionsForExam(exam.id),
  };
}

export async function getPublishedExamBundleBySlug(slug: string) {
  const exam = await getExamBySlug(slug);

  if (!exam || exam.status !== "published") {
    return null;
  }

  return {
    exam,
    questions: await listQuestionsForExam(exam.id),
  };
}

export async function createExam(input: {
  teacherId: number;
  title: string;
  instructions: string;
  creationMode: CreationMode;
  difficultyLevel: DifficultyLevel | null;
  aiPrompt?: string;
}) {
  const db = await getDb();
  const timestamp = nowIso();
  const publicId = createPublicId("exam");
  const publicSlug = slugify(input.title);

  await executeRun(db.insert(exams).values({
    publicId,
    teacherId: input.teacherId,
    title: input.title,
    instructions: input.instructions,
    creationMode: input.creationMode,
    difficultyLevel: input.difficultyLevel,
    aiPrompt: input.aiPrompt ?? null,
    status: "draft",
    publicSlug,
    publishedAt: null,
    closedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return (await getExamByPublicId(publicId))!;
}

export async function updateExamMeta(input: {
  publicId: string;
  title: string;
  instructions: string;
  difficultyLevel: DifficultyLevel | null;
}) {
  const db = await getDb();
  const existing = await getExamByPublicId(input.publicId);

  if (!existing) {
    throw new Error("Exam not found.");
  }

  await executeRun(db.update(exams)
    .set({
      title: input.title,
      instructions: input.instructions,
      difficultyLevel: input.difficultyLevel,
      updatedAt: nowIso(),
    })
    .where(eq(exams.publicId, input.publicId))
  );
}

export async function countQuestionsForExam(examId: number) {
  const db = await getDb();
  const rows = await executeMany(
    db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.examId, examId)),
  );

  return Number(rows[0]?.count ?? 0);
}

export async function setExamStatus(
  examPublicId: string,
  status: ExamStatus,
) {
  const db = await getDb();
  const exam = await getExamByPublicId(examPublicId);

  if (!exam) {
    throw new Error("Exam not found.");
  }

  if (status === "published" && (await countQuestionsForExam(exam.id)) === 0) {
    throw new Error("Add at least one question before publishing.");
  }

  const timestamp = nowIso();

  await executeRun(db.update(exams)
    .set({
      status,
      publishedAt: status === "published" ? timestamp : exam.publishedAt,
      closedAt: status === "closed" ? timestamp : null,
      updatedAt: timestamp,
    })
    .where(eq(exams.publicId, examPublicId))
  );
}

export async function addQuestion(input: {
  examPublicId: string;
  type: QuestionType;
  questionText: string;
  teacherNotes?: string;
  correctAnswerKey?: OptionKey | null;
  options?: Partial<Record<OptionKey, string>>;
}) {
  const db = await getDb();
  const bundle = await getExamBundle(input.examPublicId);

  if (!bundle) {
    throw new Error("Exam not found.");
  }

  const timestamp = nowIso();
  const publicId = createPublicId("q");
  const orderIndex =
    bundle.questions.reduce((max, question) => Math.max(max, question.orderIndex), 0) + 1;

  const [insertedQuestion] = await executeMany(
    db
    .insert(questions)
    .values({
      publicId,
      examId: bundle.exam.id,
      type: input.type,
      questionText: input.questionText,
      orderIndex,
      correctAnswerKey:
        input.type === "multiple_choice" ? input.correctAnswerKey ?? "A" : null,
      teacherNotes: input.teacherNotes?.trim() || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning({ id: questions.id }),
  );

  if (input.type === "multiple_choice") {
    const optionValues = normalizeOptions(input.options ?? {});
    await executeRun(db.insert(questionOptions)
      .values(
        optionValues.map((option) => ({
          questionId: insertedQuestion.id,
          optionKey: option.key,
          optionText: option.text,
          createdAt: timestamp,
        })),
      )
    );
  }
}

export async function updateQuestion(input: {
  questionPublicId: string;
  questionText: string;
  teacherNotes?: string;
  correctAnswerKey?: OptionKey | null;
  options?: Partial<Record<OptionKey, string>>;
}) {
  const db = await getDb();
  const question = await executeRead(db.query.questions.findFirst({
    where: eq(questions.publicId, input.questionPublicId),
  }));

  if (!question) {
    throw new Error("Question not found.");
  }

  const timestamp = nowIso();

  await executeRun(db.update(questions)
    .set({
      questionText: input.questionText,
      teacherNotes: input.teacherNotes?.trim() || null,
      correctAnswerKey:
        question.type === "multiple_choice"
          ? input.correctAnswerKey ?? "A"
          : null,
      updatedAt: timestamp,
    })
    .where(eq(questions.id, question.id))
  );

  if (question.type === "multiple_choice") {
    const optionValues = normalizeOptions(input.options ?? {});

    for (const option of optionValues) {
      const existing = await executeRead(db.query.questionOptions.findFirst({
        where: and(
          eq(questionOptions.questionId, question.id),
          eq(questionOptions.optionKey, option.key),
        ),
      }));

      if (existing) {
        await executeRun(db.update(questionOptions)
          .set({ optionText: option.text })
          .where(eq(questionOptions.id, existing.id))
        );
      } else {
        await executeRun(db.insert(questionOptions)
          .values({
            questionId: question.id,
            optionKey: option.key,
            optionText: option.text,
            createdAt: timestamp,
          })
        );
      }
    }
  }
}

export async function duplicateQuestionByPublicId(input: {
  examPublicId: string;
  questionPublicId: string;
}) {
  const db = await getDb();
  const bundle = await getExamBundle(input.examPublicId);

  if (!bundle) {
    throw new Error("Exam not found.");
  }

  const sourceQuestion = bundle.questions.find(
    (question) => question.publicId === input.questionPublicId,
  );

  if (!sourceQuestion) {
    throw new Error("Question not found.");
  }

  await executeRun(db.update(questions)
    .set({
      orderIndex: sql`${questions.orderIndex} + 1`,
    })
    .where(
      and(
        eq(questions.examId, bundle.exam.id),
        sql`${questions.orderIndex} > ${sourceQuestion.orderIndex}`,
      ),
    )
  );

  const timestamp = nowIso();
  const [insertedQuestion] = await executeMany(
    db
    .insert(questions)
    .values({
      publicId: createPublicId("q"),
      examId: bundle.exam.id,
      type: sourceQuestion.type,
      questionText: `${sourceQuestion.questionText} (Copy)`,
      orderIndex: sourceQuestion.orderIndex + 1,
      correctAnswerKey: sourceQuestion.correctAnswerKey,
      teacherNotes: sourceQuestion.teacherNotes,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning({ id: questions.id }),
  );

  if (sourceQuestion.type === "multiple_choice") {
    await executeRun(db.insert(questionOptions)
      .values(
        sourceQuestion.options.map((option) => ({
          questionId: insertedQuestion.id,
          optionKey: option.key,
          optionText: option.text,
          createdAt: timestamp,
        })),
      )
    );
  }

  await executeRun(db.update(exams)
    .set({ updatedAt: timestamp })
    .where(eq(exams.id, bundle.exam.id))
  );
}

export async function moveQuestionByPublicId(input: {
  examPublicId: string;
  questionPublicId: string;
  direction: "up" | "down";
}) {
  const db = await getDb();
  const bundle = await getExamBundle(input.examPublicId);

  if (!bundle) {
    throw new Error("Exam not found.");
  }

  const currentIndex = bundle.questions.findIndex(
    (question) => question.publicId === input.questionPublicId,
  );

  if (currentIndex === -1) {
    throw new Error("Question not found.");
  }

  const swapIndex = input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (swapIndex < 0 || swapIndex >= bundle.questions.length) {
    return;
  }

  const currentQuestion = bundle.questions[currentIndex];
  const targetQuestion = bundle.questions[swapIndex];
  const timestamp = nowIso();

  await executeRun(db.update(questions)
    .set({
      orderIndex: targetQuestion.orderIndex,
      updatedAt: timestamp,
    })
    .where(eq(questions.publicId, currentQuestion.publicId))
  );

  await executeRun(db.update(questions)
    .set({
      orderIndex: currentQuestion.orderIndex,
      updatedAt: timestamp,
    })
    .where(eq(questions.publicId, targetQuestion.publicId))
  );

  await executeRun(db.update(exams)
    .set({ updatedAt: timestamp })
    .where(eq(exams.id, bundle.exam.id))
  );
}

export async function deleteQuestionByPublicId(questionPublicId: string) {
  const db = await getDb();
  await executeRun(db.delete(questions).where(eq(questions.publicId, questionPublicId)));
}

export async function listSubmissionsForExam(examPublicId: string): Promise<SubmissionListItem[]> {
  const db = await getDb();
  const exam = await getExamByPublicId(examPublicId);

  if (!exam) {
    return [];
  }

  return (await executeMany(db.query.submissions.findMany({
      where: eq(submissions.examId, exam.id),
      orderBy: (table, { desc: sortDesc }) => [sortDesc(table.submittedAt)],
    })))
    .map((submission) => ({
      publicId: submission.publicId,
      studentName: submission.studentName,
      submittedAt: submission.submittedAt,
      mcqScore: submission.mcqScore,
      mcqTotal: submission.mcqTotal,
    }));
}

export async function getSubmissionDetail(
  examPublicId: string,
  submissionPublicId: string,
): Promise<SubmissionDetail | null> {
  const db = await getDb();
  const exam = await getExamByPublicId(examPublicId);

  if (!exam) {
    return null;
  }

  const submission = await executeRead(db.query.submissions.findFirst({
    where: and(
      eq(submissions.examId, exam.id),
      eq(submissions.publicId, submissionPublicId),
    ),
  }));

  if (!submission) {
    return null;
  }

  const examQuestions = await listQuestionsForExam(exam.id);
  const answerRows = await executeMany(db.query.submissionAnswers.findMany({
    where: eq(submissionAnswers.submissionId, submission.id),
  }));

  return {
    publicId: submission.publicId,
    studentName: submission.studentName,
    submittedAt: submission.submittedAt,
    mcqScore: submission.mcqScore,
    mcqTotal: submission.mcqTotal,
    answers: examQuestions.map((question) => {
      const answer = answerRows.find((entry) => entry.questionId === question.id);

      return {
        questionPublicId: question.publicId,
        questionText: question.questionText,
        questionType: question.type,
        answerText: answer?.answerText ?? null,
        selectedOptionKey: (answer?.selectedOptionKey as OptionKey | null) ?? null,
        correctAnswerKey: question.correctAnswerKey,
        isCorrect:
          typeof answer?.isCorrect === "number"
            ? Boolean(answer.isCorrect)
            : null,
        options: question.options,
      };
    }),
  };
}

export async function createAttempt(input: { examSlug: string; studentName: string }) {
  const db = await getDb();
  const bundle = await getPublishedExamBundleBySlug(input.examSlug);

  if (!bundle) {
    throw new Error("Exam is not available.");
  }

  if (bundle.exam.status === "closed") {
    throw new Error("This exam is already closed.");
  }

  const timestamp = nowIso();
  const publicToken = createPublicId("attempt");

  await executeRun(db.insert(examAttempts)
    .values({
      publicToken,
      examId: bundle.exam.id,
      studentName: input.studentName,
      status: "started",
      startedAt: timestamp,
      submittedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  );

  return publicToken;
}

export async function getAttemptBundle(input: {
  examSlug: string;
  attemptToken: string;
}) {
  const db = await getDb();
  const attempt = await executeRead(db.query.examAttempts.findFirst({
    where: eq(examAttempts.publicToken, input.attemptToken),
  }));

  if (!attempt) {
    return null;
  }

  const exam = await getExamBySlug(input.examSlug);

  if (!exam || exam.id !== attempt.examId || exam.status !== "published") {
    return null;
  }

  return {
    exam,
    attempt,
    questions: await listQuestionsForExam(exam.id),
  };
}

export async function submitAttempt(input: {
  attemptToken: string;
  answersByQuestionPublicId: Record<string, string>;
}) {
  const db = await getDb();
  const attempt = await executeRead(db.query.examAttempts.findFirst({
    where: eq(examAttempts.publicToken, input.attemptToken),
  }));

  if (!attempt) {
    throw new Error("Attempt not found.");
  }

  if (attempt.status === "submitted") {
    throw new Error("This attempt has already been submitted.");
  }

  const exam = await executeRead(db.query.exams.findFirst({
    where: eq(exams.id, attempt.examId),
  }));

  if (!exam || exam.status !== "published") {
    throw new Error("Exam is not available.");
  }

  const examQuestions = await listQuestionsForExam(exam.id);
  const timestamp = nowIso();
  const submissionPublicId = createPublicId("sub");

  let mcqScore = 0;
  let mcqTotal = 0;

  const [insertedSubmission] = await executeMany(
    db
    .insert(submissions)
    .values({
      publicId: submissionPublicId,
      examId: exam.id,
      attemptId: attempt.id,
      studentName: attempt.studentName,
      mcqScore: 0,
      mcqTotal: 0,
      submittedAt: timestamp,
      createdAt: timestamp,
    })
    .returning({ id: submissions.id }),
  );

  for (const question of examQuestions) {
    const rawValue = input.answersByQuestionPublicId[question.publicId]?.trim() ?? "";
    let isCorrect: number | null = null;
    let selectedOptionKey: OptionKey | null = null;
    let answerText: string | null = null;

    if (question.type === "multiple_choice") {
      selectedOptionKey = (rawValue || null) as OptionKey | null;
      mcqTotal += 1;
      isCorrect =
        selectedOptionKey && selectedOptionKey === question.correctAnswerKey ? 1 : 0;

      if (isCorrect) {
        mcqScore += 1;
      }
    } else {
      answerText = rawValue || null;
    }

    await executeRun(db.insert(submissionAnswers)
      .values({
        submissionId: insertedSubmission.id,
        questionId: question.id,
        answerText,
        selectedOptionKey,
        isCorrect,
        createdAt: timestamp,
      })
    );
  }

  await executeRun(db.update(submissions)
    .set({
      mcqScore,
      mcqTotal,
    })
    .where(eq(submissions.id, insertedSubmission.id))
  );

  await executeRun(db.update(examAttempts)
    .set({
      status: "submitted",
      submittedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(examAttempts.id, attempt.id))
  );

  return {
    submissionPublicId,
    studentName: attempt.studentName,
  };
}

export async function createExamFromAiDraft(input: {
  teacherId: number;
  title: string;
  prompt: string;
  difficultyLevel: DifficultyLevel;
  draft: AiGeneratedExam;
}) {
  const exam = await createExam({
    teacherId: input.teacherId,
    title: input.draft.title || input.title,
    instructions: input.draft.instructions,
    creationMode: "ai",
    difficultyLevel: input.difficultyLevel,
    aiPrompt: input.prompt,
  });

  await insertAiDraftQuestions({
    examPublicId: exam.publicId,
    draft: input.draft,
  });

  return exam;
}

async function insertAiDraftQuestions(input: {
  examPublicId: string;
  draft: AiGeneratedExam;
}) {
  for (const question of input.draft.questions) {
    if (question.type === "multiple_choice") {
      await addQuestion({
        examPublicId: input.examPublicId,
        type: "multiple_choice",
        questionText: question.questionText,
        correctAnswerKey: question.correctAnswerKey,
        options: Object.fromEntries(
          question.options.map((option) => [option.key, option.text]),
        ) as Partial<Record<OptionKey, string>>,
      });
    } else {
      await addQuestion({
        examPublicId: input.examPublicId,
        type: "essay",
        questionText: question.questionText,
      });
    }
  }
}

export async function applyAiDraftToExam(input: {
  examPublicId: string;
  prompt: string;
  difficultyLevel: DifficultyLevel;
  draft: AiGeneratedExam;
  mode: "replace" | "append";
}) {
  const db = await getDb();
  const bundle = await getExamBundle(input.examPublicId);

  if (!bundle) {
    throw new Error("Exam not found.");
  }

  const timestamp = nowIso();

  if (input.mode === "replace") {
    if (bundle.questions.length > 0) {
      await executeRun(db.delete(questionOptions)
        .where(
          inArray(
            questionOptions.questionId,
            bundle.questions.map((question) => question.id),
          ),
        )
      );
    }

    await executeRun(db.delete(questions).where(eq(questions.examId, bundle.exam.id)));

    await executeRun(db.update(exams)
      .set({
        title: input.draft.title || bundle.exam.title,
        instructions: input.draft.instructions,
        difficultyLevel: input.difficultyLevel,
        aiPrompt: input.prompt,
        updatedAt: timestamp,
      })
      .where(eq(exams.id, bundle.exam.id))
    );
  } else {
    await executeRun(db.update(exams)
      .set({
        aiPrompt: input.prompt,
        updatedAt: timestamp,
      })
      .where(eq(exams.id, bundle.exam.id))
    );
  }

  await insertAiDraftQuestions({
    examPublicId: input.examPublicId,
    draft: input.draft,
  });

  return (await getExamByPublicId(input.examPublicId))!;
}

export async function logAiGeneration(input: {
  examId?: number | null;
  promptText: string;
  promptPayloadJson: string;
  modelName: string;
  responseJson?: string;
  status: "success" | "failed";
  errorMessage?: string;
}) {
  const db = await getDb();
  await executeRun(db.insert(aiGenerationLogs)
    .values({
      publicId: createPublicId("ai"),
      examId: input.examId ?? null,
      promptText: input.promptText,
      promptPayloadJson: input.promptPayloadJson,
      modelName: input.modelName,
      responseJson: input.responseJson ?? null,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      createdAt: nowIso(),
    })
  );
}
