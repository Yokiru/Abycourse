import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  teacherId: integer("teacher_id").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions"),
  creationMode: text("creation_mode", { enum: ["manual", "ai"] }).notNull(),
  difficultyLevel: text("difficulty_level", {
    enum: ["A1", "A2", "B1", "B2", "C1"],
  }),
  aiPrompt: text("ai_prompt"),
  status: text("status", { enum: ["draft", "published", "closed"] })
    .notNull()
    .default("draft"),
  publicSlug: text("public_slug").notNull().unique(),
  publishedAt: text("published_at"),
  closedAt: text("closed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  examId: integer("exam_id").notNull(),
  type: text("type", { enum: ["multiple_choice", "essay"] }).notNull(),
  questionText: text("question_text").notNull(),
  orderIndex: integer("order_index").notNull(),
  correctAnswerKey: text("correct_answer_key", {
    enum: ["A", "B", "C", "D"],
  }),
  teacherNotes: text("teacher_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const questionOptions = sqliteTable("question_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull(),
  optionKey: text("option_key", { enum: ["A", "B", "C", "D"] }).notNull(),
  optionText: text("option_text").notNull(),
  createdAt: text("created_at").notNull(),
});

export const examAttempts = sqliteTable("exam_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicToken: text("public_token").notNull().unique(),
  examId: integer("exam_id").notNull(),
  studentName: text("student_name").notNull(),
  status: text("status", { enum: ["started", "submitted", "abandoned"] })
    .notNull()
    .default("started"),
  startedAt: text("started_at").notNull(),
  submittedAt: text("submitted_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  examId: integer("exam_id").notNull(),
  attemptId: integer("attempt_id").notNull().unique(),
  studentName: text("student_name").notNull(),
  mcqScore: integer("mcq_score"),
  mcqTotal: integer("mcq_total"),
  submittedAt: text("submitted_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const submissionAnswers = sqliteTable("submission_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id").notNull(),
  questionId: integer("question_id").notNull(),
  answerText: text("answer_text"),
  selectedOptionKey: text("selected_option_key", { enum: ["A", "B", "C", "D"] }),
  isCorrect: integer("is_correct"),
  createdAt: text("created_at").notNull(),
});

export const aiGenerationLogs = sqliteTable("ai_generation_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  examId: integer("exam_id"),
  promptText: text("prompt_text").notNull(),
  promptPayloadJson: text("prompt_payload_json"),
  modelName: text("model_name").notNull(),
  responseJson: text("response_json"),
  status: text("status", { enum: ["success", "failed"] }).notNull(),
  errorMessage: text("error_message"),
  createdAt: text("created_at").notNull(),
});
