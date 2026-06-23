import Link from "next/link";
import { Sparkles, SquareArrowOutUpRight, UserRound } from "lucide-react";
import { Button, Card, Notice, PageIntro } from "@/components/ui";
import { env } from "@/lib/env";

export default function HomePage() {
  const aiReady = Boolean(env.geminiApiKey);

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell flex flex-col gap-6">
          <PageIntro
            eyebrow="Local-first build"
            title="Aby Course siap dipakai untuk ujian online sederhana."
            description="Versi lokal ini sudah disiapkan untuk alur guru dan murid yang ringan: guru bikin exam, murid cukup isi nama, lalu jawaban masuk ke dashboard review."
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
              Fitur AI sudah dipasang, tapi untuk menjalankannya kamu masih perlu isi{" "}
              <code>GEMINI_API_KEY</code> di file <code>.env.local</code>.
            </Notice>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Card className="flex flex-col gap-5">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold">Mulai dari sisi guru</h2>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
                  Dashboard admin dipakai untuk membuat exam manual, generate draft dari Gemini, publish link, dan meninjau jawaban murid.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
                  <UserRound className="mb-4 h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="text-lg font-semibold">Admin login</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Email: <code>{env.adminEmail}</code>
                    <br />
                    Password: <code>{env.adminPassword}</code>
                  </p>
                </div>
                <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
                  <Sparkles className="mb-4 h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="text-lg font-semibold">Mode AI</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Pakai Gemini untuk bikin draft soal, lalu review dulu sebelum publish.
                  </p>
                </div>
                <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
                  <SquareArrowOutUpRight className="mb-4 h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="text-lg font-semibold">Share link</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Murid buka link, isi nama, kerjakan exam, lalu submit tanpa login.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold">Yang sudah ada di build lokal ini</h2>
              <ul className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                <li>Manual exam builder untuk pilihan ganda dan essay</li>
                <li>Publish dan tutup exam dari dashboard</li>
                <li>Public exam flow untuk murid tanpa login</li>
                <li>Submission review dari sisi guru</li>
                <li>Draft generator Gemini dengan output JSON terstruktur</li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="text-sm font-semibold text-[var(--color-primary)]"
                >
                  Masuk ke dashboard admin
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
