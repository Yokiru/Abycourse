# Cloudflare + GitHub + D1 Setup Checklist

Checklist ini mulai dari titik project lokal sudah siap, dan sisanya tinggal setup akun, repo, database, secret, lalu deploy.

Catatan penting:

- struktur project untuk Cloudflare sudah disiapkan
- runtime app sekarang sudah bisa switch ke D1
- untuk build OpenNext, WSL atau runner Linux lebih aman daripada Windows langsung

## 1. Push project ke GitHub

Di folder root project:

```bash
git init
git add .
git commit -m "Initial Aby Course app"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Kalau repo GitHub sudah ada, cukup commit dan push ke branch yang kamu pakai.

## 2. Buat akun Cloudflare

Yang kamu butuhkan:

- akun Cloudflare aktif
- Workers enabled
- D1 enabled

## 3. Login Wrangler

Masuk ke folder `app`, lalu:

```bash
npx wrangler login
```

## 4. Buat D1 database

Masih di folder `app`:

```bash
npx wrangler d1 create abycourse
```

Command ini akan mengembalikan `database_id` dan snippet binding.

## 5. Isi `wrangler.jsonc`

Edit file `app/wrangler.jsonc`:

- pastikan `name` sesuai nama worker yang kamu mau
- isi `database_id`
- kalau nama database kamu bukan `abycourse`, sesuaikan `database_name`
- ubah `NEXT_PUBLIC_APP_URL` ke domain final atau subdomain workers.dev

## 6. Siapkan secret Cloudflare

Jalankan satu per satu:

```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put GEMINI_API_KEY
```

Nilai yang cocok:

- `ADMIN_EMAIL`: email admin login
- `ADMIN_PASSWORD`: password admin produksi
- `SESSION_SECRET`: string random panjang
- `GEMINI_API_KEY`: API key Gemini kamu

## 7. Siapkan `.dev.vars` untuk preview lokal Workers

Copy file:

```text
.dev.vars.example -> .dev.vars
```

Lalu isi nilainya untuk preview lokal Cloudflare runtime.

## 8. Apply schema ke D1

Jalankan:

```bash
npm run cf:d1:apply:remote
```

Kalau mau test binding lokal D1 dulu:

```bash
npm run cf:d1:apply:local
```

Schema yang dipakai sekarang berasal dari `d1-schema.sql`.

## 9. Generate Cloudflare env typing

Opsional tapi bagus untuk step berikutnya:

```bash
npm run cf-typegen
```

## 10. Titik berhenti yang aman

Sampai sini, semua resource eksternal yang kamu butuhkan sudah bisa disiapkan:

- repo GitHub sudah siap
- akun Cloudflare sudah siap
- D1 database sudah siap
- binding dan secret sudah siap
- schema database sudah siap

Artinya, dari sisi setup eksternal kamu sudah sampai target fase ini.

## 11. Preview dan deploy

Sekarang kamu bisa lanjut ke:

```bash
npm run preview
```

Lalu deploy:

```bash
npm run deploy
```

Kalau command preview bermasalah di Windows, lanjutkan lewat WSL atau lakukan verifikasi final di GitHub/Cloudflare Linux runner.

## 12. Hubungkan GitHub ke Cloudflare

Kalau kamu mau auto deploy setiap push:

1. buka Cloudflare dashboard
2. masuk ke Workers & Pages
3. kalau worker `abycourse` sudah lebih dulu dibuat, buka worker itu lalu pilih `Settings > Build > Connect repository`
4. kalau belum ada worker, baru pilih create / import existing project
5. hubungkan repo GitHub
6. pilih repo project ini
7. set build/deploy command sesuai project

Yang aman untuk project ini:

- Install command: `npm install`
- Build command: `npm run deploy`

Kalau Cloudflare minta build dan deploy dipisah, pakai:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`

Sesudah repo sudah terhubung, push satu commit baru ke branch production supaya build pertama langsung jalan.

## 13. Catatan sesudah deploy pertama

Sesudah semua langkah di atas, yang penting tinggal verifikasi behavior di runtime Cloudflare sungguhan:

- query API sudah async
- executor query sudah dipisah
- insert penting sudah pakai `returning()`
- runtime DB sudah bisa switch local SQLite vs D1
- Cloudflare/OpenNext/Wrangler shape sudah siap

## File penting

- `app/package.json`
- `app/wrangler.jsonc`
- `app/open-next.config.ts`
- `app/.dev.vars.example`
- `d1-schema.sql`
