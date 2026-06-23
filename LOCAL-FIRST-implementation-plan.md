# Local-First Implementation Plan

## 1. Tujuan

Dokumen ini menjelaskan cara membangun MVP sepenuhnya di lokal terlebih dahulu, tanpa perlu akun Cloudflare pada fase awal.

Targetnya:

- fitur inti jadi dan bisa dites di laptop
- struktur kode tetap mudah dipindah ke Cloudflare nanti
- beban belajar infrastruktur dibuat serendah mungkin

## 2. Prinsip Kerja

- fokus ke produk dulu
- deployment nanti
- database lokal dulu
- desain data tetap kompatibel dengan target D1

## 3. Yang Kita Kerjakan Sekarang

### Phase A - project foundation

- scaffold Next.js app
- setup TypeScript
- setup styling base
- setup folder structure
- setup environment variables

Output:

- project bisa dijalankan dengan `npm run dev`
- ada struktur awal untuk admin, public exam, API, dan lib

### Phase B - local database

- pakai schema dari `d1-schema.sql`
- jalankan dalam mode SQLite lokal untuk development
- setup Drizzle schema dan migration
- buat seed admin awal

Output:

- app bisa simpan dan baca data lokal
- tidak perlu Cloudflare dulu

### Phase C - admin auth

- halaman login admin
- session login sederhana
- proteksi route admin

Output:

- area guru aman
- dashboard admin bisa dipakai

### Phase D - manual exam flow

- create exam
- add MCQ
- add essay
- save draft
- publish exam

Output:

- guru sudah bisa membuat ujian tanpa AI

### Phase E - student flow

- murid buka link
- murid isi nama
- murid kerjakan soal
- murid submit

Output:

- ujian benar-benar bisa dikerjakan end-to-end secara lokal

### Phase F - submission review

- guru lihat daftar submission
- guru buka detail jawaban

Output:

- workflow inti produk selesai

### Phase G - Gemini integration

- form generate AI
- server call ke Gemini
- validasi JSON
- hasil jadi draft editable

Output:

- pembuatan soal jadi lebih cepat

## 4. Database Strategy untuk Lokal

Untuk lokal, kita anggap D1 sebagai variasi dari SQLite.

Jadi pada fase ini:

- kita cukup pakai SQLite lokal
- desain tabel tetap mengacu ke schema D1
- query dibuat sesederhana mungkin

Keuntungan:

- lebih mudah dijalankan
- lebih mudah debug
- lebih gampang dipahami

## 5. Kapan Pindah ke Cloudflare

Kita pindah ke Cloudflare setelah kondisi ini terpenuhi:

- admin login sudah jalan
- create exam sudah jalan
- public exam flow sudah jalan
- submission tersimpan dengan benar
- AI generation minimal sudah bisa dicoba

Setelah itu baru:

1. buat akun Cloudflare
2. buat D1 database
3. sambungkan binding
4. deploy app

## 6. Hal yang Sengaja Kita Tunda

- setup Cloudflare account
- setup Wrangler
- deploy production
- konfigurasi binding D1 production
- domain production

## 7. Risiko dan Cara Jaga Arah

### Risiko

Kalau build lokal terlalu bebas, nanti migrasi ke Cloudflare bisa merepotkan.

### Pencegahan

- tetap gunakan schema yang kompatibel SQLite/D1
- jangan pakai fitur database yang spesifik ke provider lain
- pisahkan database access layer dari UI
- simpan env config dengan rapi

## 8. Rekomendasi Implementasi Praktis

Urutan kerja terbaik sekarang:

1. scaffold project
2. setup local SQLite + Drizzle
3. bikin admin login
4. bikin exam CRUD manual
5. bikin public exam flow
6. bikin submission review
7. baru integrasi Gemini

## 9. Definisi Selesai untuk Fase Lokal

Fase lokal dianggap berhasil jika:

- guru bisa login
- guru bisa buat exam
- murid bisa isi nama dan submit jawaban
- guru bisa lihat hasil jawaban
- AI draft generation minimal bisa diuji

## 10. Keputusan Saat Ini

Kita tidak akan setup Cloudflare dulu.

Kita akan:

- build lokal dulu
- simpan target arsitektur Cloudflare
- pindah ke deployment setelah produk inti stabil
