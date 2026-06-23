import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, EmptyState, PageIntro } from "@/components/ui";
import { getExamBundle, listSubmissionsForExam } from "@/lib/db/queries";
import { formatDateTime } from "@/lib/utils";

export default async function ExamSubmissionsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const bundle = await getExamBundle(examId);

  if (!bundle) {
    notFound();
  }

  const submissions = await listSubmissionsForExam(bundle.exam.publicId);

  return (
    <>
      <PageIntro
        eyebrow="Submission"
        title={`Jawaban untuk ${bundle.exam.title}`}
        description="Di sini kamu bisa lihat siapa saja yang sudah submit dan membuka detail jawaban per murid."
        actions={<Button href={`/admin/exams/${bundle.exam.publicId}`} variant="secondary">Kembali ke ringkasan</Button>}
      />

      {submissions.length === 0 ? (
        <EmptyState
          title="Belum ada submission."
          description="Begitu murid submit dari link exam, datanya akan muncul di sini."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-[var(--color-border)]">
            {submissions.map((submission) => (
              <Link
                key={submission.publicId}
                href={`/admin/exams/${bundle.exam.publicId}/submissions/${submission.publicId}`}
                className="grid gap-2 px-6 py-5 hover:bg-[var(--color-surface-muted)] md:grid-cols-[1.2fr_1fr_0.8fr]"
              >
                <div>
                  <p className="text-lg font-semibold">{submission.studentName}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Dikirim {formatDateTime(submission.submittedAt)}
                  </p>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] md:pt-1">
                  Skor pilihan ganda:{" "}
                  {submission.mcqTotal ? `${submission.mcqScore}/${submission.mcqTotal}` : "-"}
                </div>
                <div className="text-sm font-semibold text-[var(--color-primary)] md:pt-1">
                  Buka detail
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
