# Aby Course Cloudflare + D1 Prep Notes

Status saat ini:

- app masih jalan dengan `DB_DRIVER=local-sqlite`
- schema SQL tetap memakai `d1-schema.sql` supaya bentuk tabel tidak jauh dari target D1
- env dan config target Cloudflare sudah disiapkan
- query layer public API sekarang sudah async
- query execution helper sekarang sudah dipisah ke `src/lib/db/executor.ts`
- OpenNext + Wrangler config dasar sudah disiapkan
- runtime `src/lib/db/index.ts` sekarang sudah bisa switch ke Cloudflare D1

## Yang sudah disiapkan

1. `DB_DRIVER`
   - `local-sqlite` untuk development sekarang
   - `cloudflare-d1` untuk target deployment nanti

2. `LOCAL_DB_PATH`
   - path SQLite lokal sekarang bisa diubah tanpa edit source code

3. Env Cloudflare
   - `CLOUDFLARE_D1_BINDING`
   - `CLOUDFLARE_D1_DATABASE_NAME`
   - `CLOUDFLARE_D1_DATABASE_ID`
   - `CLOUDFLARE_ACCOUNT_ID`

4. `app/wrangler.jsonc`
   - source of truth untuk binding D1, vars, dan secret requirement

5. `src/lib/db/runtime.ts`
   - batas yang jelas antara runtime lokal sekarang dan target D1 nanti

6. `src/lib/db/queries.ts`
   - contract query untuk auth, actions, dan pages sekarang sudah async-friendly
   - query tidak lagi tahu langsung soal `.sync()` / `.run()` karena lewat helper executor

7. `src/lib/db/executor.ts`
   - titik adaptasi kecil antara driver sync lokal sekarang dan target async D1 nanti

8. Cloudflare app shape
   - `wrangler.jsonc`
   - `open-next.config.ts`
   - `.dev.vars.example`
   - script preview/deploy/typegen/D1 apply

9. Runtime database
   - `src/lib/db/index.ts` sekarang memilih SQLite lokal atau D1 sesuai `DB_DRIVER`
   - seed admin berjalan di local SQLite maupun D1 runtime

## Yang masih tersisa

Switch runtime D1 di kode sudah selesai, tapi masih ada hal operasional sebelum deploy final:

- push repo ke GitHub
- jalankan preview/deploy lewat WSL atau runner Linux karena OpenNext di Windows masih rewel
- verifikasi login admin dan flow exam di runtime Cloudflare sungguhan

## Jalur deploy yang sekarang paling aman

1. commit dan push repo ke GitHub
2. jalankan `npm run preview` dari WSL atau Linux runner
3. cek login admin dan pembuatan exam di runtime Cloudflare
4. jalankan `npm run deploy`
5. hubungkan repo GitHub ke Cloudflare kalau mau auto deploy

## File kunci sekarang

- `app/src/lib/db/index.ts`
- `app/src/lib/db/executor.ts`
- `app/src/lib/db/queries.ts`
- `app/src/app/actions.ts`
- `app/wrangler.jsonc`
