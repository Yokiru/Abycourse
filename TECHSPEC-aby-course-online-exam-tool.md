# Tech Spec - Aby Course Online Exam Tool

## 1. Scope Dokumen

Dokumen ini menerjemahkan PRD ke keputusan teknis awal agar implementasi MVP bisa dimulai dengan cepat.

Dokumen ini mencakup:

- arsitektur aplikasi
- sitemap
- route map
- komponen utama
- database design D1
- API contract awal
- AI generation flow dengan Gemini
- wireframe text-based
- prioritas build

## 2. Stack yang Disepakati

### Core

- Frontend + full-stack app: Next.js
- Development mode: local-first
- Target deployment runtime: Cloudflare
- Database: Cloudflare D1
- ORM/query layer: Drizzle ORM
- Auth admin: simple admin auth
- AI provider: Gemini
- Repo: GitHub

### Kenapa Next.js

Walau backend targetnya Cloudflare, Next.js memberi kecepatan build yang bagus untuk:

- admin dashboard
- public exam pages
- form handling
- route organization

Lalu dideploy ke Cloudflare menggunakan adaptor yang kompatibel.

## 2A. Strategi Build Saat Ini

Untuk fase sekarang, aplikasi akan dibangun dan diuji lokal terlebih dahulu.

Artinya:

- kita belum perlu akun Cloudflare sekarang
- kita belum perlu deploy sekarang
- kita akan fokus membuat fitur inti berjalan di laptop
- integrasi Cloudflare dan D1 production dilakukan setelah alur inti stabil

### Implikasi teknis

- selama development awal, database bisa dimock atau memakai SQLite lokal dengan shape yang sama seperti D1
- struktur kode tetap disiapkan agar mudah dipindah ke D1 nanti
- route, schema, dan API contract tetap mengikuti target akhir Cloudflare

### Prinsip penting

Build lokal dulu, tetapi jangan membuat keputusan yang menyulitkan migrasi ke Cloudflare nanti.

## 3. Arsitektur Tingkat Tinggi

Sistem terdiri dari 3 area:

### 1. Admin app

Dipakai guru untuk:

- login
- membuat exam manual
- generate exam dengan AI
- edit draft AI
- publish exam
- melihat submissions

### 2. Public exam app

Dipakai murid untuk:

- membuka link exam
- input nama
- mengerjakan soal
- submit jawaban

### 3. Server/API layer

Bertugas untuk:

- autentikasi admin
- CRUD exam
- generate soal via Gemini
- validasi submission
- simpan data ke D1

## 4. Sitemap

### Public

- `/e/[slug]` -> halaman intro exam + input nama
- `/e/[slug]/start` -> optional redirect/start gate
- `/e/[slug]/attempt/[attemptToken]` -> halaman soal
- `/e/[slug]/submitted` -> konfirmasi submit

### Admin

- `/admin/login`
- `/admin`
- `/admin/exams`
- `/admin/exams/new`
- `/admin/exams/[examId]`
- `/admin/exams/[examId]/edit`
- `/admin/exams/[examId]/preview`
- `/admin/exams/[examId]/submissions`
- `/admin/exams/[examId]/submissions/[submissionId]`

### API

- `/api/admin/login`
- `/api/admin/logout`
- `/api/admin/exams`
- `/api/admin/exams/[examId]`
- `/api/admin/exams/[examId]/publish`
- `/api/admin/exams/[examId]/close`
- `/api/admin/exams/generate-ai`
- `/api/public/exams/[slug]`
- `/api/public/exams/[slug]/start`
- `/api/public/exams/[slug]/submit`

## 5. Navigation Structure

### Admin nav

- Exams
- New Exam
- Logout

### Exam detail tabs

- Overview
- Questions
- Preview
- Submissions

## 6. Auth Strategy

### MVP recommendation

Karena saat ini kemungkinan besar hanya 1 guru, strategi paling simpel:

- satu admin account
- login pakai email + password
- session cookie httpOnly

### Kenapa ini cocok untuk MVP

- lebih cepat diimplementasi
- cukup aman untuk awal
- lebih sederhana daripada multi-user auth

### Fase berikutnya

- magic link
- multi-teacher support
- role separation

## 7. Data Flow Utama

### Flow A - create exam manual

1. Admin login.
2. Admin membuat exam draft.
3. Admin menambah questions.
4. Admin save.
5. Admin preview.
6. Admin publish.
7. Public slug aktif.

### Flow B - create exam with AI

1. Admin isi AI form.
2. Server panggil Gemini.
3. Server validasi output JSON.
4. Server mengubah hasil AI menjadi draft exam.
5. Admin review/edit.
6. Admin publish.

### Flow C - student attempt

1. Murid buka public link.
2. System load exam metadata.
3. Murid isi nama.
4. Server membuat attempt token.
5. Murid isi jawaban.
6. Murid submit.
7. Server validasi dan simpan submission.

## 8. Halaman dan Tujuan

### `/admin/exams`

Tujuan:

- melihat semua exam
- melihat status
- melihat jumlah submission
- akses cepat ke edit/preview/submissions

Komponen:

- header
- create button
- exam list table
- status badge
- row actions

### `/admin/exams/new`

Tujuan:

- memilih mode manual atau AI

Komponen:

- mode toggle
- exam meta form
- AI config form
- manual question editor

### `/admin/exams/[examId]/edit`

Tujuan:

- menyempurnakan draft exam

Komponen:

- title + instructions
- question blocks
- add MCQ button
- add essay button
- save draft
- publish action

### `/e/[slug]`

Tujuan:

- memberi instruksi singkat
- meminta nama murid

Komponen:

- exam title
- intro/instructions
- name field
- start button

### `/e/[slug]/attempt/[attemptToken]`

Tujuan:

- menampilkan semua soal
- mengumpulkan jawaban

Komponen:

- header exam
- progress label
- MCQ radio options
- essay textareas
- submit button

## 9. Design Implementation Notes

Referensi desain utama mengikuti `DESIGN-speako-framer-website.md`, dengan adaptasi:

### Public pages

- visual lebih lembut
- lebih banyak whitespace
- CTA ungu dominan
- kartu/form rounded

### Admin pages

- masih pakai warna dan tipografi yang sama
- layout lebih padat dan produktif
- tabel/list jelas, minim dekorasi

### Suggested tokens

- `--bg: #ffffff`
- `--fg: #000000`
- `--muted: #666666`
- `--primary: #451af5`
- `--secondary: #06792a`
- `--border-soft: #fbfaff`
- `--radius-xl: 24px`
- `--radius-2xl: 32px`
- `--radius-pill: 999px`
- spacing base `14px`

## 10. Database Design

Skema detail ada di file SQL terpisah, tetapi model intinya:

### `admin_users`

- menyimpan akun guru/admin

### `exams`

- metadata exam

### `questions`

- daftar soal

### `question_options`

- opsi MCQ

### `exam_attempts`

- sesi pengerjaan murid sebelum/ketika submit

### `submissions`

- record final submit

### `submission_answers`

- jawaban per soal

### `ai_generation_logs`

- log prompt dan hasil AI

### Catatan local-first

Walau target akhir adalah D1, pada fase lokal kita boleh:

- mulai dari schema SQL yang kompatibel SQLite
- menjalankan database lokal untuk development
- menjaga query tetap sederhana dan kompatibel dengan D1

## 11. Relationship Summary

- satu `admin_user` punya banyak `exams`
- satu `exam` punya banyak `questions`
- satu `question` bisa punya banyak `question_options`
- satu `exam` punya banyak `exam_attempts`
- satu `exam_attempt` punya nol atau satu `submission`
- satu `submission` punya banyak `submission_answers`

## 12. API Contract Awal

### `POST /api/admin/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "ok": true,
  "user": {
    "id": "adm_123",
    "name": "Eci"
  }
}
```

### `POST /api/admin/exams`

Request:

```json
{
  "title": "Simple Past Tense Quiz",
  "instructions": "Answer all questions.",
  "creationMode": "manual",
  "difficultyLevel": "A2"
}
```

Response:

```json
{
  "ok": true,
  "examId": "exam_123"
}
```

### `POST /api/admin/exams/generate-ai`

Request:

```json
{
  "title": "Reading Comprehension Test",
  "topicPrompt": "Buat ujian bahasa Inggris tentang reading comprehension untuk anak SMP.",
  "mcqCount": 10,
  "essayCount": 3,
  "difficultyLevel": "B1",
  "outputLanguage": "English",
  "extraInstructions": "Fokus pada short passage dan vocabulary."
}
```

Response:

```json
{
  "ok": true,
  "draftExam": {
    "title": "Reading Comprehension Test",
    "instructions": "Read carefully and answer all questions.",
    "questions": []
  }
}
```

### `GET /api/public/exams/[slug]`

Response:

```json
{
  "ok": true,
  "exam": {
    "title": "Simple Past Tense Quiz",
    "instructions": "Answer all questions.",
    "status": "published"
  }
}
```

### `POST /api/public/exams/[slug]/start`

Request:

```json
{
  "studentName": "Rani"
}
```

Response:

```json
{
  "ok": true,
  "attemptToken": "attempt_public_token",
  "attemptUrl": "/e/simple-past-tense/attempt/attempt_public_token"
}
```

### `POST /api/public/exams/[slug]/submit`

Request:

```json
{
  "attemptToken": "attempt_public_token",
  "answers": [
    {
      "questionId": "q1",
      "selectedOptionKey": "B"
    },
    {
      "questionId": "q2",
      "answerText": "She went to school yesterday."
    }
  ]
}
```

Response:

```json
{
  "ok": true,
  "submissionId": "sub_123"
}
```

## 13. Validation Rules

### Admin side

- title wajib
- minimal 1 soal total sebelum publish
- semua MCQ harus punya 4 opsi
- semua MCQ harus punya 1 correct answer
- AI config `mcqCount + essayCount` dibatasi

### Suggested limits MVP

- max 30 soal per exam
- max 20 MCQ
- max 10 essay
- max 120 karakter untuk student name

### Public side

- student name wajib
- hanya exam `published` yang bisa dimulai
- exam `closed` tidak bisa diakses
- attempt token harus valid
- submit hanya 1 kali per attempt

## 14. AI Generation Flow

### Input

- title
- topic prompt
- difficulty level
- mcq count
- essay count
- output language
- extra instructions

### Server process

1. Build structured prompt.
2. Call Gemini.
3. Parse JSON response.
4. Validate against schema.
5. If valid, return draft.
6. If invalid, retry once with repair prompt.
7. If still invalid, return error ke admin UI.

### Why draft-first

Soal bahasa sering butuh:

- perbaikan grammar
- penyesuaian level
- penggantian konteks
- koreksi opsi jawaban

Karena itu AI output tidak boleh publish otomatis.

## 15. Suggested JSON Shape for AI Output

```json
{
  "title": "Simple Past Tense Quiz",
  "instructions": "Answer all questions carefully.",
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "Which sentence is in the simple past tense?",
      "options": [
        { "key": "A", "text": "She goes to school." },
        { "key": "B", "text": "She went to school." },
        { "key": "C", "text": "She is going to school." },
        { "key": "D", "text": "She goes to school every day." }
      ],
      "correctAnswerKey": "B"
    },
    {
      "type": "essay",
      "questionText": "Write three sentences about what you did yesterday."
    }
  ]
}
```

## 16. Wireframe Text-Based

### A. Admin Exam List

```text
+--------------------------------------------------------------+
| Aby Course Admin                       [New Exam] [Logout]  |
+--------------------------------------------------------------+
| Exams                                                        |
|--------------------------------------------------------------|
| Title                    Status      Submissions    Actions  |
| Simple Past Tense Quiz   Published   12             View     |
| Reading Practice Test    Draft       0              Edit     |
| Vocabulary Week 3        Closed      8              Review   |
+--------------------------------------------------------------+
```

### B. Create Exam Screen

```text
+--------------------------------------------------------------+
| Create Exam                                                  |
| [ Manual ] [ AI ]                                            |
|--------------------------------------------------------------|
| Title                                                        |
| [_______________________________________________]            |
| Instructions                                                 |
| [_______________________________________________]            |
|                                                              |
| If AI mode:                                                  |
| Topic Prompt                                                 |
| [_______________________________________________]            |
| MCQ Count    [ 10 ]                                          |
| Essay Count  [ 3 ]                                           |
| Difficulty   [ B1 v ]                                        |
| Extra Notes  [___________________________________]           |
|                                                              |
| [Generate Draft]   [Save Draft]                              |
+--------------------------------------------------------------+
```

### C. Student Start Screen

```text
+--------------------------------------------------+
| Simple Past Tense Quiz                           |
|--------------------------------------------------|
| Please answer all questions carefully.           |
|                                                  |
| Your Name                                        |
| [____________________________________]           |
|                                                  |
|                 [ Start Exam ]                   |
+--------------------------------------------------+
```

### D. Student Exam Screen

```text
+--------------------------------------------------+
| Simple Past Tense Quiz                           |
| 12 Questions                                     |
|--------------------------------------------------|
| 1. Which sentence is in the simple past tense?   |
| ( ) She goes to school.                          |
| ( ) She went to school.                          |
| ( ) She is going to school.                      |
| ( ) She goes to school every day.                |
|                                                  |
| 2. Write three sentences about yesterday.        |
| [__________________________________________]     |
| [__________________________________________]     |
| [__________________________________________]     |
|                                                  |
|                     [ Submit ]                   |
+--------------------------------------------------+
```

## 17. D1 Notes

### Recommended approach

- gunakan integer primary key autoincrement untuk internal relation
- gunakan public id atau slug untuk exposure ke UI/API bila perlu
- simpan timestamp dalam ISO string UTC

### Index priorities

- `exams(public_slug)`
- `questions(exam_id, order_index)`
- `exam_attempts(exam_id, started_at)`
- `submissions(exam_id, submitted_at)`
- `submission_answers(submission_id, question_id)`

## 18. Error Handling

### Public

- exam not found
- exam closed
- invalid attempt token
- duplicate submit

### Admin

- unauthorized
- AI generation failed
- invalid AI output
- publish blocked karena draft belum valid

## 19. Security Notes

- Gemini API key hanya di server
- admin session cookie `httpOnly`, `secure`, `sameSite=lax`
- validasi semua input di server
- sanitize text rendering
- jangan expose correct answer ke public route

## 20. Build Order Recommendation

### Phase 1

- project scaffold
- local database setup
- admin auth
- exam CRUD manual

### Phase 2

- public exam flow
- attempts
- submissions

### Phase 3

- Gemini integration
- AI draft editing

### Phase 4

- preview page
- close exam
- polish UI with Speako-inspired tokens
- persiapan migrasi ke Cloudflare

## 21. Final Recommendation

Untuk implementasi tercepat dan tetap rapi:

- pakai Next.js + Drizzle + D1
- develop lokal dulu, deploy belakangan
- 1 admin user dulu
- draft-first AI workflow
- public exam tanpa login
- semua desain mengikuti tone Speako, tapi admin tetap utilitarian
