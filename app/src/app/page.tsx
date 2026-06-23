import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ClipboardList,
  FilePenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button, Notice, PageIntro } from "@/components/ui";
import { env } from "@/lib/env";

export default function HomePage() {
  const aiReady = Boolean(env.geminiApiKey);

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell flex flex-col gap-8">
          <PageIntro
            eyebrow="Teacher Admin Workspace"
            title="Ruang admin yang rapi untuk membuat, membagikan, dan menilai exam online."
            description="Aby Course dibuat untuk alur guru privat yang cepat: susun soal manual atau dengan AI, bagikan link tanpa login murid, lalu review semua submission dari satu workspace."
            actions={
              <>
                <Button href="/admin/login">Masuk Admin</Button>
                <Button href="/admin/exams/new" variant="secondary">
                  Buat Exam Baru
                </Button>
              </>
            }
          />

          {!aiReady ? (
            <Notice tone="info">
              Mode manual sudah siap dipakai. Untuk generator AI, aktifkan akses Gemini di pengaturan aplikasi.
            </Notice>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: FilePenLine,
                title: "Susun exam lebih cepat",
                description:
                  "Buat struktur ujian yang rapi untuk pilihan ganda dan essay, lalu edit dari satu editor yang sama.",
              },
              {
                icon: Sparkles,
                title: "Generate draft dengan AI",
                description:
                  "Tulis materi, atur jumlah soal dan tingkat kesulitan, lalu review hasil Gemini sebelum publish.",
              },
              {
                icon: ClipboardList,
                title: "Pantau submission guru",
                description:
                  "Setelah murid submit, jawaban langsung masuk ke dashboard review tanpa akun murid dan tanpa alur tambahan.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <section key={title} className="surface-card flex min-h-56 flex-col gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
                  <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    {description}
                  </p>
                </div>
              </section>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="surface-card flex flex-col gap-5 p-6 md:p-8">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Workflow Guru
                </p>
                <h2 className="text-3xl font-semibold text-[var(--color-text)]">
                  Semua langkah utama ada dalam satu alur kerja.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Siapkan draft",
                    description:
                      "Mulai manual atau pakai AI sesuai materi yang sedang kamu ajarkan.",
                  },
                  {
                    step: "02",
                    title: "Publish link",
                    description:
                      "Bagikan link exam ke murid. Murid cukup isi nama lalu langsung mulai.",
                  },
                  {
                    step: "03",
                    title: "Review hasil",
                    description:
                      "Baca jawaban, cek score MCQ, dan simpan versi print untuk dokumen guru.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="border-t border-[var(--color-border)] pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0"
                  >
                    <p className="text-sm font-semibold text-[var(--color-primary)]">{item.step}</p>
                    <h3 className="mt-3 text-lg font-semibold text-[var(--color-text)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card flex flex-col gap-5 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Admin Access
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                    Masuk ke workspace guru.
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Halaman admin dipakai untuk mengelola draft, status publish, link exam, submission, dan file print PDF dalam satu tempat yang tenang dan fokus kerja.
              </p>
              <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                <div className="flex items-start gap-3">
                  <BookOpenText className="mt-1 h-4 w-4 text-[var(--color-primary)]" />
                  <span>Editor soal manual dan AI sudah terhubung ke alur publish yang sama.</span>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpenText className="mt-1 h-4 w-4 text-[var(--color-primary)]" />
                  <span>Link murid tetap sederhana tanpa login atau form tambahan.</span>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpenText className="mt-1 h-4 w-4 text-[var(--color-primary)]" />
                  <span>Review submission dan dokumen print tetap siap untuk kebutuhan kelas privat.</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button href="/admin/login">Buka Admin</Button>
                <Link
                  href="/admin/exams"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
                >
                  Lihat workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
