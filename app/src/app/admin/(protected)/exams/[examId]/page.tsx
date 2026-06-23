import Link from "next/link";
import { notFound } from "next/navigation";
import { closeExamAction } from "@/app/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button, Card, PageIntro, StatusPill } from "@/components/ui";
import { getExamBundle, listSubmissionsForExam } from "@/lib/db/queries";
import { env } from "@/lib/env";
import { absoluteExamLink, formatDateTime, getDifficultyDescription } from "@/lib/utils";

export default async function ExamOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { examId } = await params;
  const bundle = await getExamBundle(examId);

  if (!bundle) {
    notFound();
  }

  await searchParams;
  const submissions = await listSubmissionsForExam(bundle.exam.publicId);
  const shareUrl = absoluteExamLink(env.appUrl, bundle.exam.publicSlug);

  return (
    <>
      <PageIntro
        eyebrow="Ringkasan Exam"
        title={bundle.exam.title}
        description={bundle.exam.instructions || "Belum ada instruksi khusus untuk murid."}
        actions={
          <>
            <Button href={`/admin/exams/${bundle.exam.publicId}/edit`} variant="secondary">
              Edit Soal
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/preview`} variant="secondary">
              Lihat Tampilan
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/submissions`}>
              Lihat Jawaban
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={bundle.exam.status} />
            {bundle.exam.difficultyLevel ? (
              <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                {bundle.exam.difficultyLevel} - {getDifficultyDescription(bundle.exam.difficultyLevel)}
              </span>
            ) : null}
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {bundle.exam.creationMode === "ai" ? "AI" : "Manual"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-secondary)]">Jumlah soal</p>
              <p className="mt-3 text-3xl font-semibold">{bundle.questions.length}</p>
            </div>
            <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-secondary)]">Submission</p>
              <p className="mt-3 text-3xl font-semibold">{submissions.length}</p>
            </div>
            <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-secondary)]">Update terakhir</p>
              <p className="mt-3 text-lg font-semibold">{formatDateTime(bundle.exam.updatedAt)}</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Link murid</p>
              <CopyLinkButton value={shareUrl} />
            </div>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-sm font-medium text-[var(--color-primary)]"
            >
              {shareUrl}
            </a>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-2xl font-semibold">Aksi cepat</h2>
          <div className="flex flex-col gap-3">
            <Button href={`/admin/exams/${bundle.exam.publicId}/edit`} variant="secondary">
              Edit soal
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/print`} variant="secondary">
              Cetak PDF
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/print/answers`} variant="secondary">
              Kunci Jawaban PDF
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/submissions`} variant="secondary">
              Buka submission
            </Button>
            {bundle.exam.status !== "closed" ? (
              <form action={closeExamAction}>
                <input type="hidden" name="examPublicId" value={bundle.exam.publicId} />
                <Button type="submit" variant="danger" className="w-full">
                  Tutup exam
                </Button>
              </form>
            ) : null}
          </div>
          <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <p>Murid cukup membuka link di atas, menulis nama, lalu mulai mengerjakan.</p>
            <p>
              Kalau kamu mau cek tampilan publiknya dulu, buka{" "}
              <Link href={`/admin/exams/${bundle.exam.publicId}/preview`} className="font-semibold text-[var(--color-primary)]">
                tampilan murid
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
