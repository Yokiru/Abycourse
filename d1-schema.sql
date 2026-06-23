-- Aby Course Online Exam Tool
-- Cloudflare D1 schema for MVP

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  teacher_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  creation_mode TEXT NOT NULL CHECK (creation_mode IN ('manual', 'ai')),
  difficulty_level TEXT CHECK (difficulty_level IN ('A1', 'A2', 'B1', 'B2', 'C1')),
  ai_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  public_slug TEXT NOT NULL UNIQUE,
  published_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  exam_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'essay')),
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  correct_answer_key TEXT CHECK (correct_answer_key IN ('A', 'B', 'C', 'D') OR correct_answer_key IS NULL),
  teacher_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_key TEXT NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (question_id, option_key),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_token TEXT NOT NULL UNIQUE,
  exam_id INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'submitted', 'abandoned')),
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  exam_id INTEGER NOT NULL,
  attempt_id INTEGER NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  mcq_score INTEGER,
  mcq_total INTEGER,
  submitted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_text TEXT,
  selected_option_key TEXT CHECK (selected_option_key IN ('A', 'B', 'C', 'D') OR selected_option_key IS NULL),
  is_correct INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE (submission_id, question_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  exam_id INTEGER,
  prompt_text TEXT NOT NULL,
  prompt_payload_json TEXT,
  model_name TEXT NOT NULL,
  response_json TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_public_slug ON exams(public_slug);
CREATE INDEX IF NOT EXISTS idx_questions_exam_order ON questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_started_at ON exam_attempts(exam_id, started_at);
CREATE INDEX IF NOT EXISTS idx_submissions_exam_submitted_at ON submissions(exam_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submission_answers_submission_question ON submission_answers(submission_id, question_id);
