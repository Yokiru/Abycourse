import { notFound } from "next/navigation";
import { Button, Card, PageIntro } from "@/components/ui";
import { getExamBundle } from "@/lib/db/queries";

export default async function PreviewExamPage({
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

  return (
    <>
      <PageIntro
        eyebrow="Student preview"
        title={bundle.exam.title}
        description={bundle.exam.instructions || "Tidak ada instruksi tambahan."}
        actions={<Button href={`/admin/exams/${bundle.exam.publicId}/edit`} variant="secondary">Kembali ke editor</Button>}
      />

      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold">Start screen</h2>
        <div className="rounded-[24px] bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">Your Name</p>
          <div className="mt-3 rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            Student enters their name here
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {bundle.questions.map((question, index) => (
          <Card key={question.publicId} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                Question {index + 1}
              </p>
              <h2 className="text-xl font-semibold">{question.questionText}</h2>
            </div>
            {question.type === "multiple_choice" ? (
              <div className="grid gap-3">
                {question.options.map((option) => (
                  <div
                    key={option.key}
                    className="rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-sm"
                  >
                    <span className="font-semibold">{option.key}.</span> {option.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
                Essay answer field
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
