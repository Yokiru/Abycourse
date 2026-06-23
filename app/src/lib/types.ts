export type DifficultyLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type ExamStatus = "draft" | "published" | "closed";
export type CreationMode = "manual" | "ai";
export type QuestionType = "multiple_choice" | "essay";
export type OptionKey = "A" | "B" | "C" | "D";

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface QuestionRecord {
  id: number;
  publicId: string;
  examId: number;
  type: QuestionType;
  questionText: string;
  orderIndex: number;
  correctAnswerKey: OptionKey | null;
  teacherNotes: string | null;
  options: QuestionOption[];
}

export interface ExamRecord {
  id: number;
  publicId: string;
  teacherId: number;
  title: string;
  instructions: string | null;
  creationMode: CreationMode;
  difficultyLevel: DifficultyLevel | null;
  aiPrompt: string | null;
  status: ExamStatus;
  publicSlug: string;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamListItem extends ExamRecord {
  questionCount: number;
  submissionCount: number;
}

export interface SubmissionListItem {
  publicId: string;
  studentName: string;
  submittedAt: string;
  mcqScore: number | null;
  mcqTotal: number | null;
}

export interface SubmissionAnswerRecord {
  questionPublicId: string;
  questionText: string;
  questionType: QuestionType;
  answerText: string | null;
  selectedOptionKey: OptionKey | null;
  correctAnswerKey: OptionKey | null;
  isCorrect: boolean | null;
  options: QuestionOption[];
}

export interface SubmissionDetail {
  publicId: string;
  studentName: string;
  submittedAt: string;
  mcqScore: number | null;
  mcqTotal: number | null;
  answers: SubmissionAnswerRecord[];
}

export interface AiGeneratedExam {
  title: string;
  instructions: string;
  questions: Array<
    | {
        type: "multiple_choice";
        questionText: string;
        options: QuestionOption[];
        correctAnswerKey: OptionKey;
      }
    | {
        type: "essay";
        questionText: string;
      }
  >;
}
