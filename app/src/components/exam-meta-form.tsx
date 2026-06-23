"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { saveExamMetaAction } from "@/app/actions";
import { difficultyLevels, getDifficultyDescription } from "@/lib/utils";
import { Button, Field, Input, Select, Textarea } from "./ui";
import { AutosaveStatus } from "./autosave-status";
import { useAutosaveForm } from "./use-autosave-form";

export function ExamMetaForm({
  examPublicId,
  title,
  instructions,
  difficultyLevel,
}: {
  examPublicId: string;
  title: string;
  instructions: string | null;
  difficultyLevel: string | null;
}) {
  const router = useRouter();
  const { formRef, status, isPending, handleChange, handleBlurCapture, handleManualSubmit } =
    useAutosaveForm({
      action: saveExamMetaAction,
      successMessage: "Detail exam tersimpan.",
      onManualSuccess: () => {
        router.refresh();
      },
    });

  return (
    <form
      ref={formRef}
      onSubmit={handleManualSubmit}
      onChange={handleChange}
      onBlurCapture={handleBlurCapture}
      className="grid gap-5 md:grid-cols-2"
    >
      <input type="hidden" name="examPublicId" value={examPublicId} />
      <Field label="Judul exam">
        <Input name="title" defaultValue={title} required />
      </Field>
      <Field label="Difficulty">
        <Select name="difficultyLevel" defaultValue={difficultyLevel ?? "A2"}>
          {difficultyLevels.map((level) => (
            <option key={level} value={level}>
              {level} - {getDifficultyDescription(level)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Field label="Instruksi murid">
          <Textarea name="instructions" defaultValue={instructions ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <AutosaveStatus status={status} />
        <Button type="submit" disabled={isPending} aria-disabled={isPending} className="gap-2">
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {isPending ? "Menyimpan detail..." : "Simpan sekarang"}
        </Button>
      </div>
    </form>
  );
}
