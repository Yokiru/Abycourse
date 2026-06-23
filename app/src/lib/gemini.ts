import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "./env";
import type { AiGeneratedExam, DifficultyLevel } from "./types";
import { optionKeys } from "./utils";

const aiSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().min(1),
  questions: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("multiple_choice"),
          questionText: z.string().min(1),
          options: z
            .array(
              z.object({
                key: z.enum(optionKeys),
                text: z.string().min(1),
              }),
            )
            .length(4),
          correctAnswerKey: z.enum(optionKeys),
        }),
        z.object({
          type: z.literal("essay"),
          questionText: z.string().min(1),
        }),
      ]),
    )
    .min(1),
});

const systemPrompt = `You are an expert English private tutor assessment generator.

Create a clean, age-appropriate English exam based on the teacher request.

Rules:
- Return valid JSON only.
- Do not wrap the JSON in markdown.
- Do not include explanations before or after the JSON.
- Follow the requested number of multiple-choice and essay questions exactly.
- Multiple-choice questions must always include exactly 4 options with keys A, B, C, and D.
- Every multiple-choice question must include one correctAnswerKey.
- Essay questions must not include options.
- Keep the difficulty aligned to the requested CEFR-style level: A1, A2, B1, B2, or C1.
- Use natural, grammatically correct English unless the teacher explicitly requests another output language.
- Keep questions varied and useful for real student evaluation.
- Avoid duplicated questions.

Return JSON with this exact shape:
{
  "title": "string",
  "instructions": "string",
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "string",
      "options": [
        { "key": "A", "text": "string" },
        { "key": "B", "text": "string" },
        { "key": "C", "text": "string" },
        { "key": "D", "text": "string" }
      ],
      "correctAnswerKey": "A"
    },
    {
      "type": "essay",
      "questionText": "string"
    }
  ]
}`;

function buildUserPrompt(input: {
  title: string;
  topicPrompt: string;
  difficultyLevel: DifficultyLevel;
  mcqCount: number;
  essayCount: number;
  outputLanguage: string;
  studentContext: string;
  extraInstructions: string;
}) {
  return `Create an English exam draft with the following requirements:

Exam title: ${input.title}
Topic or material: ${input.topicPrompt}
Difficulty level: ${input.difficultyLevel}
Number of multiple-choice questions: ${input.mcqCount}
Number of essay questions: ${input.essayCount}
Output language: ${input.outputLanguage}
Student profile or context: ${input.studentContext}
Additional teacher instructions: ${input.extraInstructions}

Important quality rules:
- Match the difficulty to ${input.difficultyLevel}.
- If the teacher asks for grammar, make the questions grammar-focused.
- If the teacher asks for reading, include short reading-oriented questions when appropriate.
- If the teacher asks for vocabulary, make distractors plausible but not confusing in a broken way.
- Make essay questions answerable by the student's level.
- Avoid making all questions too similar.
- Keep the instructions short and clear.`;
}

function validateDraftCounts(
  draft: AiGeneratedExam,
  expected: { mcqCount: number; essayCount: number },
) {
  const mcqCount = draft.questions.filter(
    (question) => question.type === "multiple_choice",
  ).length;
  const essayCount = draft.questions.filter(
    (question) => question.type === "essay",
  ).length;

  if (mcqCount !== expected.mcqCount || essayCount !== expected.essayCount) {
    throw new Error(
      `Question count mismatch. Expected ${expected.mcqCount} multiple-choice and ${expected.essayCount} essay, but got ${mcqCount} and ${essayCount}.`,
    );
  }

  return draft;
}

function humanizeGeminiError(error: unknown) {
  const rawMessage =
    error instanceof Error ? error.message : "Unknown Gemini error.";
  const message = rawMessage.toLowerCase();

  if (message.includes("api key") || message.includes("api_key") || message.includes("credential")) {
    return "Gemini API key belum valid atau belum terpasang dengan benar. Cek isi GEMINI_API_KEY di .env.local lalu restart app.";
  }

  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted")
  ) {
    return "Permintaan ke Gemini lagi penuh atau kuota hari ini sudah menipis. Tunggu sebentar lalu coba generate lagi.";
  }

  if (
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "Koneksi ke Gemini lagi tidak stabil. Coba generate ulang beberapa saat lagi.";
  }

  if (
    message.includes("json") ||
    message.includes("schema") ||
    message.includes("unexpected token") ||
    message.includes("question count mismatch")
  ) {
    return "Gemini sempat mengembalikan draft dengan format yang belum rapi. Coba generate ulang atau kurangi jumlah soal supaya hasilnya lebih stabil.";
  }

  if (message.includes("400") || message.includes("invalid argument")) {
    return "Permintaan ke Gemini belum bisa diproses. Coba cek prompt materi, jumlah soal, atau difficulty lalu kirim lagi.";
  }

  return `Generate AI gagal: ${rawMessage}`;
}

async function runModel(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: systemPrompt,
    },
  });

  return response.text ?? "";
}

export async function generateExamDraftWithGemini(input: {
  title: string;
  topicPrompt: string;
  difficultyLevel: DifficultyLevel;
  mcqCount: number;
  essayCount: number;
  outputLanguage: string;
  studentContext: string;
  extraInstructions: string;
}) {
  if (!env.geminiApiKey) {
    throw new Error(
      "GEMINI API key belum diisi. Tambahkan GEMINI_API_KEY di .env.local lalu restart app.",
    );
  }

  const prompt = buildUserPrompt(input);
  let rawResponse = await runModel(prompt);

  try {
    const parsedDraft = aiSchema.parse(JSON.parse(rawResponse)) as AiGeneratedExam;

    return {
      prompt,
      draft: validateDraftCounts(parsedDraft, input),
      rawResponse,
    };
  } catch (firstError) {
    const repairPrompt = `Your previous response did not match the required JSON schema.

Please try again.

Return valid JSON only.
Do not include markdown.
Do not include commentary.
Make sure:
- the JSON is syntactically valid
- the number of multiple-choice questions is exactly ${input.mcqCount}
- the number of essay questions is exactly ${input.essayCount}
- every multiple-choice item has exactly 4 options
- every multiple-choice item has a valid correctAnswerKey

Original request:
${prompt}`;

    try {
      rawResponse = await runModel(repairPrompt);
      const repairedDraft = aiSchema.parse(JSON.parse(rawResponse)) as AiGeneratedExam;

      return {
        prompt,
        draft: validateDraftCounts(repairedDraft, input),
        rawResponse,
      };
    } catch (repairError) {
      throw new Error(
        humanizeGeminiError(repairError instanceof Error ? repairError : firstError),
      );
    };
  }
}
