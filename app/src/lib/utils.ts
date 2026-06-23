import { customAlphabet } from "nanoid";
import type { DifficultyLevel, ExamStatus, OptionKey, QuestionOption } from "./types";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export const difficultyLevels: DifficultyLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
];

export const optionKeys: OptionKey[] = ["A", "B", "C", "D"];

export const aiPromptPresets = [
  {
    id: "grammar",
    label: "Grammar",
    topicPrompt: "Buat ujian Bahasa Inggris yang fokus pada grammar dan akurasi struktur kalimat.",
    extraInstructions:
      "Utamakan tenses, sentence structure, dan error recognition yang sesuai level murid.",
  },
  {
    id: "reading",
    label: "Reading",
    topicPrompt: "Buat ujian Bahasa Inggris yang fokus pada reading comprehension.",
    extraInstructions:
      "Sertakan pertanyaan tentang main idea, detail, inference, dan vocabulary in context bila cocok.",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    topicPrompt: "Buat ujian Bahasa Inggris yang fokus pada vocabulary dan word usage.",
    extraInstructions:
      "Gunakan pilihan kata yang natural, distractor yang masuk akal, dan konteks kalimat yang jelas.",
  },
] as const;

export function createPublicId(prefix: string) {
  return `${prefix}_${nanoid()}`;
}

export function slugify(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "exam"}-${nanoid(6)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusLabel(status: ExamStatus) {
  if (status === "draft") {
    return "Draft";
  }

  if (status === "published") {
    return "Published";
  }

  return "Closed";
}

export function getDifficultyDescription(level: DifficultyLevel) {
  const map: Record<DifficultyLevel, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper-Intermediate",
    C1: "Advanced",
  };

  return map[level];
}

export function normalizeOptions(
  options: Partial<Record<OptionKey, string>>,
): QuestionOption[] {
  return optionKeys.map((key) => ({
    key,
    text: options[key]?.trim() ?? "",
  }));
}

export function examLink(slug: string) {
  return `/e/${slug}`;
}

export function absoluteExamLink(baseUrl: string, slug: string) {
  return `${baseUrl.replace(/\/$/, "")}${examLink(slug)}`;
}

export function clampText(input: FormDataEntryValue | null, fallback = "") {
  return typeof input === "string" ? input.trim() : fallback;
}

export function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
