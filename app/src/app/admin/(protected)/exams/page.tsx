import Link from "next/link";
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

  return (
    <>
      <PageIntro
        eyebrow="Dashboard"
        title="Semua exam kamu ada di sini."
        description="Bikin draft manual, generate dari Gemini, publish link ke murid, lalu review submission dari tempat yang sama."
        actions={<Button href="/admin/exams/new">Buat Exam</Button>}
      />

      {exams.length === 0 ? (
        <EmptyState
          title="Belum ada exam."
          description="Mulai dari satu draft sederhana dulu. Setelah itu alur publish, share link, dan review jawaban sudah siap dipakai."
          action={<Button href="/admin/exams/new">Buat exam pertamamu</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_1.1fr] gap-4 border-b border-[var(--color-border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] md:grid">
            <span>Exam</span>
            <span>Status</span>
            <span>Questions</span>
            <span>Submissions</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {exams.map((exam) => (
              <Link
                key={exam.publicId}
                href={`/admin/exams/${exam.publicId}`}
                className="grid gap-4 px-6 py-5 hover:bg-[var(--color-surface-muted)] md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_1.1fr]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">{exam.title}</h2>
                    <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      {exam.creationMode === "ai" ? "AI" : "Manual"}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {absoluteExamLink(env.appUrl, exam.publicSlug)}
                  </p>
                </div>
                <div className="md:pt-1">
                  <StatusPill status={exam.status} />
                </div>
                <div className="text-sm font-medium md:pt-1">{exam.questionCount}</div>
                <div className="text-sm font-medium md:pt-1">{exam.submissionCount}</div>
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
