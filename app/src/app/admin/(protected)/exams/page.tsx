import Link from "next/link";
import { Clock3, FileCheck2, Link2, Sparkles } from "lucide-react";
import { Button, Card, EmptyState, PageIntro, StatusPill } from "@/components/ui";
import { listExams } from "@/lib/db/queries";
import { absoluteExamLink, formatDateTime } from "@/lib/utils";
import { env } from "@/lib/env";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  const exams = await listExams();
  const draftCount = exams.filter((exam) => exam.status === "draft").length;
  const publishedCount = exams.filter((exam) => exam.status === "published").length;
  const totalQuestions = exams.reduce((sum, exam) => sum + exam.questionCount, 0);
  const totalSubmissions = exams.reduce((sum, exam) => sum + exam.submissionCount, 0);
  const lastUpdated = exams[0]?.updatedAt ?? null;

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

      {exams.length === 0 ? (
        <EmptyState
          title="Belum ada exam."
          description="Mulai dari satu draft sederhana dulu. Setelah itu alur publish, share link, dan review jawaban sudah siap dipakai."
          action={<Button href="/admin/exams/new">Buat exam pertamamu</Button>}
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
          <div className="hidden grid-cols-[1.5fr_0.8fr_0.7fr_0.9fr_1.05fr] gap-4 border-b border-[var(--color-border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] md:grid">
            <span>Exam</span>
            <span>Status</span>
            <span>Soal</span>
            <span>Submission</span>
            <span>Update</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {exams.map((exam) => (
              <Link
                key={exam.publicId}
                href={`/admin/exams/${exam.publicId}`}
                className="grid gap-4 px-6 py-5 transition hover:bg-[var(--color-surface-muted)] md:grid-cols-[1.5fr_0.8fr_0.7fr_0.9fr_1.05fr]"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">{exam.title}</h2>
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
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
