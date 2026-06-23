import { notFound } from "next/navigation";
import { publishExamAction } from "@/app/actions";
import { AddQuestionPanels } from "@/components/add-question-panels";
import { AiExamComposerForm } from "@/components/ai-exam-composer-form";
import { ExamMetaForm } from "@/components/exam-meta-form";
import { QuestionDraftCard } from "@/components/question-draft-card";
import { Button, Card, PageIntro } from "@/components/ui";
import { getExamBundle } from "@/lib/db/queries";
import { env } from "@/lib/env";

export default async function EditExamPage({
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
  const currentMcqCount = bundle.questions.filter(
    (question) => question.type === "multiple_choice",
  ).length;
  const currentEssayCount = bundle.questions.filter(
    (question) => question.type === "essay",
  ).length;

  return (
    <>
      <PageIntro
        eyebrow="Edit draft"
        title={`Rapikan ${bundle.exam.title}`}
        description="Di sini kamu bisa menyempurnakan metadata exam, menambah soal baru, dan revisi hasil draft sebelum dibagikan ke murid."
        actions={
          <>
            <Button href={`/admin/exams/${bundle.exam.publicId}`} variant="secondary">
              Overview
            </Button>
            <Button href={`/admin/exams/${bundle.exam.publicId}/preview`} variant="secondary">
              Preview
            </Button>
          </>
        }
      />

      <Card>
        <div className="grid gap-4">
          <ExamMetaForm
            examPublicId={bundle.exam.publicId}
            title={bundle.exam.title}
            instructions={bundle.exam.instructions}
            difficultyLevel={bundle.exam.difficultyLevel}
          />
          <form action={publishExamAction}>
            <input type="hidden" name="examPublicId" value={bundle.exam.publicId} />
            <Button type="submit" variant="secondary">
              Publish exam
            </Button>
          </form>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Gemini assist</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Regenerate draft penuh kalau hasil sebelumnya kurang pas, atau tambahkan batch soal baru tanpa menghapus pertanyaan yang sudah kamu edit.
          </p>
        </div>
        <AiExamComposerForm
          key={`${bundle.exam.updatedAt}-${bundle.questions.length}`}
          examPublicId={bundle.exam.publicId}
          initialValues={{
            title: bundle.exam.title,
            topicPrompt: bundle.exam.aiPrompt ?? bundle.exam.title,
            difficultyLevel: bundle.exam.difficultyLevel ?? "B1",
            mcqCount: currentMcqCount || 8,
            essayCount: currentEssayCount || 2,
            outputLanguage: "English",
            studentContext: "Indonesian private English student",
            extraInstructions: bundle.exam.instructions ?? "",
          }}
          showApiNotice={!env.geminiApiKey}
        />
      </Card>

      <AddQuestionPanels examPublicId={bundle.exam.publicId} />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Question bank draft</h2>
        {bundle.questions.length === 0 ? (
          <Card>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada soal. Tambahkan minimal satu soal sebelum publish.
            </p>
          </Card>
        ) : (
          bundle.questions.map((question) => (
            <QuestionDraftCard
              key={question.publicId}
              examPublicId={bundle.exam.publicId}
              question={question}
              defaultOpen={question.orderIndex <= 2}
            />
          ))
        )}
      </div>
    </>
  );
}
