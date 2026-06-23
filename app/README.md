# Aby Course

Tools ujian online untuk guru private Bahasa Inggris.

## Sudah jadi

- login admin sederhana
- buat exam manual
- draft exam dengan Gemini
- edit MCQ dan essay
- publish dan close exam
- link ujian publik tanpa login murid
- student attempt dan submit
- review submission guru
- print PDF lembar murid
- print PDF kunci jawaban

## Stack utama

- Next.js 16
- Tailwind CSS 4
- Drizzle ORM
- SQLite lokal untuk development saat ini
- OpenNext adapter untuk target deploy ke Cloudflare Workers

## Jalankan lokal

```bash
npm install
npm run dev
```

App lokal:

```text
http://127.0.0.1:3000
```

## Login admin lokal

Default login yang diseed otomatis:

```text
Email: teacher@abycourse.local
Password: teach123!
```

## Environment lokal

Salin:

```text
.env.example -> .env.local
```

Mode database lokal sekarang:

```text
DB_DRIVER=local-sqlite
```

## Cloudflare prep yang sudah disiapkan

File yang sekarang sudah siap:

- `wrangler.jsonc`
- `open-next.config.ts`
- `public/_headers`
- `.dev.vars.example`
- `../CLOUDFLARE-D1-MIGRATION-NOTES.md`
- `../CLOUDFLARE-SETUP-CHECKLIST.md`

Script yang sudah tersedia:

```bash
npm run preview
npm run deploy
npm run upload
npm run cf-typegen
npm run cf:d1:apply:local
npm run cf:d1:apply:remote
```

Catatan:

- script di atas sudah disiapkan supaya jalur deploy nanti konsisten
- runtime app sekarang bisa switch antara SQLite lokal dan Cloudflare D1 lewat `DB_DRIVER`
- untuk development harian tetap paling ringan pakai `DB_DRIVER=local-sqlite`

## Status migrasi database

Saat ini project mendukung dua runtime database:

- `local-sqlite` untuk development lokal biasa
- `cloudflare-d1` untuk target Cloudflare runtime

Yang sudah dirapikan:

- public query API sudah async
- query executor sudah dipisah
- insert yang sebelumnya bergantung ke `lastInsertRowid` sudah diganti ke `returning()`
- runtime `src/lib/db/index.ts` sekarang sudah bisa memilih SQLite lokal vs Cloudflare D1
- seed admin sudah disiapkan untuk local SQLite dan D1 runtime

Itu bikin migrasi ke D1 nanti lebih realistis dan lebih kecil blast radius-nya.

## Setup Cloudflare nanti

Urutan setup manual yang tersisa:

1. push repo ke GitHub
2. buat akun Cloudflare
3. login Wrangler
4. buat D1 database
5. isi `database_id` di `wrangler.jsonc`
6. isi secret Cloudflare
7. apply schema ke D1
8. kalau mau, kamu bisa berhenti di titik ini kalau targetmu baru setup resource Cloudflare
9. lanjut preview/deploy dengan runtime D1
10. hubungkan repo GitHub ke Cloudflare kalau mau auto deploy

Detail langkahnya ada di:

`../CLOUDFLARE-SETUP-CHECKLIST.md`

## Catatan Windows

OpenNext memberi warning resmi bahwa dukungan Windows belum sepenuhnya stabil.

Untuk deploy dan preview runtime Workers yang paling aman:

- pakai WSL di laptop ini, atau
- biarkan build final dijalankan di GitHub / Cloudflare yang berbasis Linux

## AI Gemini

Mode AI aktif setelah `GEMINI_API_KEY` diisi.

Default model:

```text
gemini-3.1-flash-lite
```

## Verifikasi

```bash
npm run lint
npm run build
```
