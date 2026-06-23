"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import {
  addEssayQuestionAction,
  addMcqQuestionAction,
} from "@/app/actions";
import { optionKeys } from "@/lib/utils";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { useToast } from "./toast-provider";

export function AddQuestionPanels({ examPublicId }: { examPublicId: string }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AddMcqCard examPublicId={examPublicId} />
      <AddEssayCard examPublicId={examPublicId} />
    </div>
  );
}

function AddMcqCard({ examPublicId }: { examPublicId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await addMcqQuestionAction(formData);
      showToast({
        tone: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <Card className="h-full">
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
        <input type="hidden" name="examPublicId" value={examPublicId} />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Tambah pilihan ganda</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Format ini sudah disiapkan untuk empat opsi tetap agar cepat dan konsisten.
          </p>
        </div>
        <Field label="Pertanyaan">
          <Textarea name="questionText" required />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          {optionKeys.map((key) => (
            <Field key={key} label={`Opsi ${key}`}>
              <Input name={`option${key}`} required />
            </Field>
          ))}
        </div>
        <Field label="Jawaban benar">
          <Select name="correctAnswerKey" defaultValue="A">
            {optionKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Catatan guru (opsional)">
          <Textarea name="teacherNotes" className="min-h-24" />
        </Field>
        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button type="submit" disabled={isPending} aria-disabled={isPending} className="w-full gap-2">
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Menambahkan MCQ..." : "Tambah Soal MCQ"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AddEssayCard({ examPublicId }: { examPublicId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await addEssayQuestionAction(formData);
      showToast({
        tone: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <Card className="h-full">
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
        <input type="hidden" name="examPublicId" value={examPublicId} />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Tambah essay</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Cocok untuk writing, reasoning, atau jawaban singkat yang nanti kamu review manual.
          </p>
        </div>
        <Field label="Pertanyaan essay">
          <Textarea name="questionText" required />
        </Field>
        <Field label="Catatan guru (opsional)">
          <Textarea name="teacherNotes" className="min-h-24" />
        </Field>
        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button type="submit" disabled={isPending} aria-disabled={isPending} className="w-full gap-2">
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Menambahkan essay..." : "Tambah Soal Essay"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
