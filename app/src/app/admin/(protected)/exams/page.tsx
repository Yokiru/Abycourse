import Link from "next/link";
import { Clock3, FileCheck2, Link2, Sparkles } from "lucide-react";
import { duplicateExamAction } from "@/app/actions";
import { Button, Card, EmptyState, Input, PageIntro, Select, StatusPill } from "@/components/ui";
import { listExams } from "@/lib/db/queries";
import { absoluteExamLink, firstParam, formatDateTime } from "@/lib/utils";
import { env } from "@/lib/env";
import type { CreationMode, ExamStatus } from "@/lib/types";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim() ?? "";
  const status = (firstParam(params.status) as ExamStatus | "all" | undefined) ?? "all";
  const creationMode =
    (firstParam(params.mode) as CreationMode | "all" | undefined) ?? "all";
  const exams = await listExams({
    query: query || undefined,
    status,
    creationMode,
  });
  const draftCount = exams.filter((exam) => exam.status === "draft").length;
  const publishedCount = exams.filter((exam) => exam.status === "published").length;
  const totalQuestions = exams.reduce((sum, exam) => sum + exam.questionCount, 0);
  const totalSubmissions = exams.reduce((sum, exam) => sum + exam.submissionCount, 0);
  const lastUpdated = exams[0]?.updatedAt ?? null;
  const hasFilters = query.length > 0 || status !== "all" || creationMode !== "all";

  return (
    <>
      <PageIntro
        eyebrow="Workspace Guru"
        title="Kelola semua exam dari dashboard yang lebih siap produksi."
        description="Draft, status publish, link murid, dan submission review semuanya tetap dekat, jadi alur kerja guru terasa singkat dan rapi."
        actions={<Button href="/admin/exams/new">Buat Exam</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: FileCheck2,
            label: "Jumlah exam",
            value: exams.length,
            note: `${draftCount} draft aktif`,
          },
          {
            icon: Link2,
            label: "Sudah tayang",
            value: publishedCount,
            note: publishedCount > 0 ? "Siap dibagikan ke murid" : "Belum ada link aktif",
          },
          {
            icon: Sparkles,
            label: "Total soal",
            value: totalQuestions,
            note: "Gabungan semua MCQ dan essay",
          },
          {
            icon: Clock3,
            label: "Jumlah submission",
            value: totalSubmissions,
            note: lastUpdated ? `Update terakhir ${formatDateTime(lastUpdated)}` : "Belum ada aktivitas",
          },
        ].map(({ icon: Icon, label, value, note }) => (
          <section key={label} className="surface-card flex min-h-40 flex-col gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
              <Icon className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
              <p className="text-3xl font-semibold text-[var(--color-text)]">{value}</p>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{note}</p>
            </div>
          </section>
        ))}
      </div>

      <Card className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">Cari dan filter</h2>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              Temukan exam lama lebih cepat, lalu buka ulang atau buat salinannya untuk kelas berikutnya.
            </p>
          </div>
          {hasFilters ? (
            <Button href="/admin/exams" variant="ghost">
              Reset filter
            </Button>
          ) : null}
        </div>
        <form className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_auto]">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Cari judul exam, materi, atau topik"
          />
          <Select name="status" defaultValue={status}>
            <option value="all">Semua status</option>
            <option value="draft">Draft</option>
            <option value="published">Dipublish</option>
            <option value="closed">Ditutup</option>
          </Select>
          <Select name="mode" defaultValue={creationMode}>
            <option value="all">Semua mode</option>
            <option value="manual">Manual</option>
            <option value="ai">AI</option>
          </Select>
          <Button type="submit">Terapkan</Button>
        </form>
      </Card>

      {exams.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Belum ada exam yang cocok." : "Belum ada exam."}
          description={
            hasFilters
              ? "Coba ganti kata kunci atau longgarkan filter supaya daftar exam yang kamu cari muncul."
              : "Mulai dari satu draft sederhana dulu. Setelah itu alur publish, share link, dan review jawaban sudah siap dipakai."
          }
          action={
            hasFilters ? (
              <Button href="/admin/exams" variant="secondary">
                Lihat semua exam
              </Button>
            ) : (
              <Button href="/admin/exams/new">Buat exam pertamamu</Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                  Daftar exam
                </h2>
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  Buka satu exam untuk edit soal, publish link, review submission, atau print PDF.
                </p>
              </div>
              <Button href="/admin/exams/new" variant="secondary">
                Exam Baru
              </Button>
            </div>
          </div>
          <div className="hidden grid-cols-[1.45fr_0.8fr_0.7fr_0.85fr_1fr_0.9fr] gap-4 border-b border-[var(--color-border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] md:grid">
            <span>Exam</span>
            <span>Status</span>
            <span>Soal</span>
            <span>Submission</span>
            <span>Update</span>
            <span className="text-right">Aksi</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {exams.map((exam) => (
              <div
                key={exam.publicId}
                className="grid gap-4 px-6 py-5 transition hover:bg-[var(--color-surface-muted)] md:grid-cols-[1.45fr_0.8fr_0.7fr_0.85fr_1fr_0.9fr]"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/exams/${exam.publicId}`}
                      className="text-lg font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]"
                    >
                      {exam.title}
                    </Link>
                    <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      {exam.creationMode === "ai" ? "AI" : "Manual"}
                    </span>
                  </div>
                  <p className="truncate text-sm leading-6 text-[var(--color-text-secondary)]">
                    {absoluteExamLink(env.appUrl, exam.publicSlug)}
                  </p>
                </div>
                <div className="md:pt-1">
                  <StatusPill status={exam.status} />
                </div>
                <div className="text-sm font-medium text-[var(--color-text)] md:pt-1">
                  {exam.questionCount}
                </div>
                <div className="text-sm font-medium text-[var(--color-text)] md:pt-1">
                  {exam.submissionCount}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] md:pt-1">
                  {formatDateTime(exam.updatedAt)}
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                  <Button href={`/admin/exams/${exam.publicId}`} variant="ghost" className="min-h-9 px-3 text-xs">
                    Buka
                  </Button>
                  <form action={duplicateExamAction}>
                    <input type="hidden" name="examPublicId" value={exam.publicId} />
                    <Button type="submit" variant="secondary" className="min-h-9 px-3 text-xs">
                      Duplikasi
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
