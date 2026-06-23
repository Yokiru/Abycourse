import { notFound } from "next/navigation";
import { Button, Card, PageIntro } from "@/components/ui";
import { getExamBundle, getSubmissionDetail } from "@/lib/db/queries";
import { formatDateTime } from "@/lib/utils";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ examId: string; submissionId: string }>;
}) {
  const { examId, submissionId } = await params;
  const bundle = await getExamBundle(examId);
  const submission = await getSubmissionDetail(examId, submissionId);

  if (!bundle || !submission) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Detail submission"
        title={submission.studentName}
        description={`Dikirim ${formatDateTime(submission.submittedAt)}`}
        actions={<Button href={`/admin/exams/${bundle.exam.publicId}/submissions`} variant="secondary">Kembali ke daftar</Button>}
      />

      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold">Ringkasan</h2>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Skor pilihan ganda:{" "}
          {submission.mcqTotal ? `${submission.mcqScore}/${submission.mcqTotal}` : "Belum ada MCQ"}
        </p>
      </Card>

      <div className="flex flex-col gap-4">
        {submission.answers.map((answer, index) => (
          <Card key={answer.questionPublicId} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                Soal {index + 1}
              </p>
              <h2 className="text-xl font-semibold">{answer.questionText}</h2>
            </div>
            {answer.questionType === "multiple_choice" ? (
              <div className="grid gap-3">
                {answer.options.map((option) => {
                  const isChosen = answer.selectedOptionKey === option.key;
                  const isCorrect = answer.correctAnswerKey === option.key;

                  return (
                    <div
                      key={option.key}
                      className={`rounded-[18px] border px-4 py-3 text-sm ${
                        isCorrect
                          ? "border-[rgba(6,121,42,0.22)] bg-[rgba(6,121,42,0.08)]"
                          : isChosen
                            ? "border-[rgba(69,26,245,0.22)] bg-[rgba(69,26,245,0.08)]"
                            : "border-[var(--color-border)]"
                      }`}
                    >
                      <span className="font-semibold">{option.key}.</span> {option.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm leading-7">
                {answer.answerText || "Belum ada jawaban."}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
