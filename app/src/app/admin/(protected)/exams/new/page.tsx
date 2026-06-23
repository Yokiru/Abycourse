import { createManualExamAction } from "@/app/actions";
import { AiExamComposerForm } from "@/components/ai-exam-composer-form";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button, Card, Field, Input, Notice, PageIntro, Select, Textarea } from "@/components/ui";
import { env } from "@/lib/env";
import { difficultyLevels, firstParam, getDifficultyDescription } from "@/lib/utils";

export default async function NewExamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode = firstParam(params.mode) === "ai" ? "ai" : "manual";

  return (
    <>
      <PageIntro
        eyebrow="Create"
        title="Buat exam baru."
        description="Pilih cara paling nyaman buat kamu: tulis manual dari awal atau minta Gemini membuat draft yang nanti tetap bisa kamu edit."
      />

      <div className="flex flex-wrap gap-3">
        <Button href="/admin/exams/new?mode=manual" variant={mode === "manual" ? "primary" : "secondary"}>
          Tulis Manual
        </Button>
        <Button href="/admin/exams/new?mode=ai" variant={mode === "ai" ? "primary" : "secondary"}>
          Gunakan AI
        </Button>
      </div>

      {mode === "manual" ? (
        <Card>
          <form action={createManualExamAction} className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5 md:col-span-2">
              <h2 className="text-2xl font-semibold">Draft manual</h2>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Cocok kalau kamu sudah tahu soal apa yang mau dimasukkan dari awal.
              </p>
            </div>
            <Field label="Judul exam">
              <Input name="title" placeholder="Simple Past Tense Quiz" required />
            </Field>
            <Field label="Tingkat kesulitan">
              <Select name="difficultyLevel" defaultValue="A2">
                {difficultyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level} - {getDifficultyDescription(level)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Instruksi untuk murid">
                <Textarea
                  name="instructions"
                  placeholder="Answer all questions carefully."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <PendingSubmitButton
                idleLabel="Simpan Draft"
                pendingLabel="Menyimpan draft..."
              />
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="space-y-5">
            <div className="space-y-5 md:col-span-2">
              <h2 className="text-2xl font-semibold">Draft dari Gemini</h2>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Gemini membantu menyusun draft soal yang rapi. Hasilnya tetap masuk ke editor agar kamu bisa cek dan revisi dulu.
              </p>
              <Notice tone="info">
                Pembuatan draft AI bisa butuh beberapa detik. Setelah dikirim, proses akan berjalan sampai draft siap dibuka.
              </Notice>
            </div>
            <AiExamComposerForm
              initialValues={{
                title: "",
                topicPrompt: "",
                difficultyLevel: "B1",
                mcqCount: 8,
                essayCount: 2,
                outputLanguage: "English",
                studentContext: "Indonesian private English student",
                extraInstructions: "",
              }}
              showApiNotice={!env.geminiApiKey}
            />
          </div>
        </Card>
      )}
    </>
  );
}
