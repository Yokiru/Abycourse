# PRD - Aby Course Online Exam Tool

## 1. Ringkasan Produk

Website tools sederhana untuk guru les/private Bahasa Inggris yang memungkinkan guru:

- membuat ujian online secara manual
- membuat ujian dengan bantuan AI (Gemini)
- membagikan link ujian ke murid
- menerima jawaban murid tanpa proses login murid
- melihat hasil jawaban murid setelah submit

Produk ini ditujukan untuk pengalaman yang sangat sederhana: murid hanya membuka link, memasukkan nama, lalu mengerjakan soal.

## 2. Latar Belakang

Saat ini kebutuhan utamanya adalah memberi ujian online kepada murid private secara cepat tanpa setup rumit. Flow harus ringan agar murid tidak bingung, tetapi guru tetap punya kontrol untuk membuat soal, memantau jawaban, dan meninjau hasil.

Karena pembuatan soal bisa memakan waktu, sistem juga perlu menyediakan mode AI generation memakai Gemini agar guru bisa menghasilkan draft soal dari prompt materi tertentu.

## 3. Tujuan Produk

### Tujuan utama

- Memudahkan guru membuat dan membagikan ujian online.
- Memudahkan murid mengerjakan ujian hanya dengan nama.
- Memungkinkan guru melihat semua jawaban murid dengan cepat.
- Menghemat waktu pembuatan soal lewat AI.

### Target MVP

- Guru dapat membuat exam manual.
- Guru dapat membuat exam dengan AI Gemini.
- Murid dapat masuk ke exam dengan nama tanpa login.
- Murid dapat menjawab soal pilihan ganda dan essay.
- Jawaban tersimpan ke database.
- Guru dapat melihat daftar submission dan detail jawaban.

## 4. Non-Goals MVP

Fitur berikut tidak wajib di versi pertama:

- login murid
- pembayaran
- timer ujian yang kompleks
- auto-grading essay yang canggih
- anti-cheat tingkat lanjut
- analitik mendalam per kompetensi
- export PDF yang kompleks

## 5. Persona

### Persona utama: Guru

Guru Bahasa Inggris private yang:

- mengajar beberapa murid
- ingin membuat ujian cepat
- tidak ingin alur teknis yang ribet
- ingin bisa pakai AI untuk membantu menyusun soal

### Persona kedua: Murid

Murid private yang:

- menerima link dari guru
- membuka ujian dari HP atau laptop
- tidak ingin login atau daftar akun
- cukup memasukkan nama dan langsung mengerjakan

## 6. Asumsi Produk

- Yang tanpa login adalah murid.
- Guru tetap perlu area admin yang aman untuk membuat exam dan melihat hasil.
- Stack utama: Cloudflare Workers + D1.
- Source control dan deployment workflow menggunakan GitHub.
- Provider AI hanya Gemini untuk efisiensi biaya.
- Arah visual utama mengacu pada `DESIGN-speako-framer-website.md`.

## 6A. Design Direction

Produk akan mengambil referensi visual dari dokumen `DESIGN-speako-framer-website.md`, dengan penyesuaian agar cocok untuk tools ujian online, bukan landing page marketing.

### Prinsip adaptasi

- Pertahankan nuansa friendly, ringan, dan approachable.
- Gunakan background terang dengan aksen utama ungu.
- Gunakan heading yang terasa tegas dan modern.
- Gunakan rounded corners agar pengalaman terasa ramah.
- Jaga admin area tetap bersih, ringkas, dan work-focused.

### Translasi ke produk ini

#### Student side

- lebih hangat dan welcoming
- layout sederhana, fokus satu tugas per layar
- CTA jelas
- form nama dan halaman soal harus terasa ringan dan tidak intimidating

#### Teacher side

- tetap memakai bahasa visual Speako
- tetapi lebih utilitarian daripada hero-style
- informasi submission, daftar exam, dan editor soal harus mudah dipindai
- hindari komposisi terlalu dekoratif agar workflow guru cepat

### Token visual awal yang akan diikuti

- Background utama: `#ffffff`
- Accent utama: `#451af5`
- Accent sekunder: `#06792a`
- Teks utama: `#000000`
- Teks sekunder: `#666666`
- Base spacing: `14px`
- Bentuk: rounded corners konsisten

### Catatan implementasi desain

- Jangan menyalin layout marketing Speako mentah-mentah ke dashboard.
- Ambil language visualnya, bukan struktur landing page-nya.
- Halaman murid boleh terasa lebih branded.
- Halaman admin harus tetap efisien, padat secukupnya, dan mudah dipakai berulang kali.

## 7. Ruang Lingkup Fitur

### 7.1 Dashboard Guru

Guru dapat:

- melihat daftar exam
- membuat exam baru
- memilih mode pembuatan: Manual atau AI
- melihat jumlah submission per exam
- membuka detail jawaban tiap murid

### 7.2 Pembuatan Exam Manual

Guru dapat:

- mengisi judul exam
- menulis instruksi singkat
- menambahkan soal pilihan ganda
- menambahkan soal essay
- menentukan status exam: draft atau published
- mendapatkan share link setelah exam dipublish

#### Struktur soal pilihan ganda

- pertanyaan
- 4 opsi jawaban
- 1 jawaban benar

#### Struktur soal essay

- pertanyaan essay
- opsional: catatan expected answer untuk guru saja

### 7.3 Pembuatan Exam dengan AI

Guru dapat mengisi:

- judul exam
- prompt materi/topik
- jumlah soal pilihan ganda
- jumlah soal essay
- tingkat kesulitan
- opsional instruksi tambahan

Sistem lalu memanggil Gemini untuk menghasilkan draft exam yang masih bisa diedit guru sebelum dipublish.

#### 5 tingkat kesulitan yang disarankan

Untuk konteks guru Bahasa Inggris, lebih baik difficulty dibuat relevan dengan level belajar:

1. Beginner (A1)
2. Elementary (A2)
3. Intermediate (B1)
4. Upper-Intermediate (B2)
5. Advanced (C1)

Catatan: ini lebih berguna daripada label umum seperti "mudah" atau "sulit", karena langsung nyambung ke kemampuan bahasa Inggris murid.

### 7.4 Akses Ujian oleh Murid

Flow murid:

1. Buka link exam.
2. Lihat judul dan instruksi.
3. Input nama.
4. Klik mulai.
5. Kerjakan soal pilihan ganda dan essay.
6. Submit jawaban.
7. Lihat halaman konfirmasi submit berhasil.

### 7.5 Submission dan Review Jawaban

Guru dapat:

- melihat daftar submission berdasarkan exam
- melihat nama murid
- melihat waktu submit
- membuka detail jawaban
- melihat pilihan jawaban untuk multiple choice
- melihat jawaban essay

## 8. User Flow

### Flow guru - manual

1. Guru masuk ke dashboard admin.
2. Guru klik "Buat Exam".
3. Guru pilih mode "Manual".
4. Guru isi judul, instruksi, dan soal.
5. Guru simpan draft.
6. Guru publish exam.
7. Sistem menghasilkan share link.
8. Guru kirim link ke murid.

### Flow guru - AI

1. Guru masuk ke dashboard admin.
2. Guru klik "Buat Exam".
3. Guru pilih mode "AI".
4. Guru isi prompt materi, jumlah MCQ, jumlah essay, dan difficulty.
5. Sistem generate draft soal via Gemini.
6. Guru review dan edit hasil AI.
7. Guru publish exam.
8. Sistem menghasilkan share link.

### Flow murid

1. Murid buka share link.
2. Murid masukkan nama.
3. Murid mengerjakan semua soal.
4. Murid submit.
5. Sistem menyimpan submission.

### Flow review guru

1. Guru buka exam tertentu.
2. Guru lihat daftar submission.
3. Guru klik salah satu murid.
4. Guru lihat detail jawaban.

## 9. Kebutuhan Fungsional

### Exam Management

- Guru dapat membuat, mengedit, menghapus, draft, dan publish exam.
- Satu exam memiliki banyak soal.
- Exam memiliki unique public link.
- Exam hanya bisa diakses murid jika status published.

### Question Types

- Sistem mendukung question type `multiple_choice`.
- Sistem mendukung question type `essay`.

### Student Submission

- Murid wajib mengisi nama sebelum mulai.
- Murid tidak perlu login.
- Satu submission terkait ke satu exam.
- Sistem menyimpan jawaban per soal.
- Setelah submit, submission tidak dapat diedit pada MVP.

### AI Generation

- Sistem menerima prompt materi dari guru.
- Sistem menerima parameter jumlah soal pilihan ganda.
- Sistem menerima parameter jumlah soal essay.
- Sistem menerima parameter difficulty 1-5.
- Sistem memanggil Gemini untuk menghasilkan draft soal.
- Hasil AI wajib bisa diedit sebelum publish.

### Admin Review

- Guru dapat melihat semua submission per exam.
- Guru dapat membuka detail jawaban murid.
- Guru dapat melihat kunci jawaban MCQ.

## 10. Kebutuhan Non-Fungsional

- Mobile-friendly untuk murid.
- Waktu loading ringan.
- UI sederhana dan mudah dipahami.
- Aman untuk akses admin.
- Data submission tersimpan stabil di D1.
- Prompt AI dan hasil generation tercatat untuk audit ringan bila diperlukan.

## 11. Struktur Halaman

### Admin

- Login/Admin access page
- Dashboard exam list
- Create exam page
- Edit/review AI draft page
- Exam detail page
- Submission list page
- Submission detail page

### Public Student

- Exam landing/start page
- Exam question page
- Submit success page

## 11A. UI/UX Notes

### Student experience

- satu kolom
- fokus penuh ke instruksi dan soal
- progress antar bagian harus jelas
- tombol submit harus menonjol
- mobile-first karena besar kemungkinan murid membuka dari HP

### Teacher experience

- dashboard berbasis list/table sederhana
- editor soal harus cepat dipakai tanpa banyak distraksi
- AI generation form harus singkat dan jelas
- submission detail harus memisahkan MCQ dan essay dengan rapi

## 12. Model Data Awal

### `teachers`

- id
- name
- email_or_login_identifier
- created_at

### `exams`

- id
- teacher_id
- title
- instructions
- creation_mode (`manual` | `ai`)
- difficulty_level
- ai_prompt
- status (`draft` | `published` | `closed`)
- public_slug
- created_at
- updated_at

### `questions`

- id
- exam_id
- type (`multiple_choice` | `essay`)
- question_text
- order_index
- correct_answer_key (untuk MCQ)
- teacher_notes

### `question_options`

- id
- question_id
- option_key (`A`, `B`, `C`, `D`)
- option_text

### `submissions`

- id
- exam_id
- student_name
- submitted_at

### `answers`

- id
- submission_id
- question_id
- answer_text
- selected_option_key

## 13. AI Prompting Requirements

Input ke Gemini minimal mencakup:

- topik/materi
- target level kesulitan
- jumlah MCQ
- jumlah essay
- bahasa output
- instruksi format output JSON yang konsisten

Output AI yang dibutuhkan:

- judul opsional
- daftar soal MCQ lengkap dengan 4 opsi dan kunci jawaban
- daftar soal essay

Requirement penting:

- hasil AI harus terstruktur agar mudah diparse
- jika output AI invalid, sistem harus menampilkan error dan minta generate ulang
- guru selalu jadi final reviewer sebelum publish

## 14. Saran Produk

Berikut saran yang menurutku akan sangat membantu:

### 1. Guru tetap pakai login sederhana

Karena murid tanpa login, area guru sebaiknya tetap aman. Opsi paling pas untuk MVP:

- login email magic link, atau
- login password sederhana untuk 1 guru dulu

Kalau semuanya tanpa proteksi, link admin berisiko bocor.

### 2. Pakai draft review sebelum publish

Jangan publish hasil AI langsung. Selalu tampilkan mode edit/review dulu karena soal bahasa sering perlu koreksi kecil.

### 3. Tambahkan status exam `closed`

Status ini berguna agar link lama tidak terus dipakai murid setelah ujian selesai.

### 4. Simpan kunci jawaban MCQ sejak awal

Ini membuka jalan untuk scoring otomatis di fase berikutnya, minimal untuk pilihan ganda.

### 5. Gunakan level CEFR sebagai difficulty

Untuk guru Bahasa Inggris, `A1-C1` lebih bermakna daripada `mudah-sulit`.

### 6. Sediakan preview exam sebelum publish

Guru akan lebih percaya diri kalau bisa lihat tampilan ujian dari sisi murid sebelum link dibagikan.

### 7. Tambahkan batasan 1 submit per nama per device sebagai opsi

Tidak wajib di MVP, tapi cukup berguna kalau nanti ingin mencegah submit berulang terlalu mudah.

## 15. Risiko dan Mitigasi

### Risiko: Murid memakai nama yang sama

Mitigasi:

- tampilkan timestamp submission
- opsional nanti tambahkan nomor HP/kode murid, tapi bukan untuk MVP

### Risiko: Output AI tidak rapi

Mitigasi:

- pakai format JSON ketat
- validasi schema output sebelum disimpan
- sediakan tombol regenerate

### Risiko: Link exam tersebar

Mitigasi:

- status `closed`
- opsional fitur expire date di fase berikutnya

### Risiko: Essay susah dinilai cepat

Mitigasi:

- pada MVP cukup tampilkan jawaban essay
- fase berikutnya bisa tambahkan AI-assisted feedback, bukan auto-grade penuh

## 16. MVP Prioritas Implementasi

### Prioritas 1

- admin login sederhana
- create exam manual
- create exam with AI Gemini
- edit hasil AI
- publish exam
- public link exam
- student input name
- submit answers
- teacher view submissions

### Prioritas 2

- preview exam
- close exam
- auto score untuk MCQ
- search/filter submission

### Prioritas 3

- export hasil
- AI feedback untuk essay
- expiry link

## 17. Success Metrics

Untuk tahap awal, produk dianggap berhasil jika:

- guru bisa membuat exam kurang dari 10 menit
- murid bisa mulai exam kurang dari 30 detik setelah buka link
- submission tersimpan tanpa error
- guru bisa membaca hasil semua murid dengan mudah
- AI generation mengurangi waktu pembuatan soal secara signifikan

## 18. Technical Direction Awal

### Stack

- Frontend: bisa pakai Next.js atau React + Cloudflare-compatible setup
- Backend/API: Cloudflare Workers
- Database: Cloudflare D1
- Repo & workflow: GitHub
- AI: Gemini API

### Saran teknis implementasi

- gunakan server-side route untuk memanggil Gemini agar API key aman
- simpan exam dan questions di D1
- gunakan slug/link unik untuk public exam
- pisahkan route admin dan public
- log error AI generation secara ringkas
- siapkan design tokens awal dari referensi Speako agar styling konsisten sejak awal

## 19. Open Questions

Hal yang sebaiknya diputuskan sebelum build:

- Apakah guru hanya 1 orang atau nanti multi-teacher?
- Apakah exam boleh dikerjakan sekali saja per murid?
- Apakah ingin ada nilai otomatis untuk MCQ di MVP?
- Apakah murid boleh lihat hasil setelah submit?
- Apakah ingin upload materi/contoh teks sebagai konteks AI pada fase awal?

## 20. Rekomendasi Final

Untuk versi pertama, fokus terbaik adalah:

- 1 akun guru
- murid tanpa login, cukup nama
- exam manual + AI
- MCQ + essay
- dashboard submission sederhana
- review hasil AI sebelum publish

Ini sudah cukup kuat untuk benar-benar dipakai sehari-hari, tanpa membuat scope terlalu melebar.
