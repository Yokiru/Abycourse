"use client";

import { LoaderCircle } from "lucide-react";
import { updateQuestionAction } from "@/app/actions";
import type { QuestionRecord } from "@/lib/types";
import { optionKeys } from "@/lib/utils";
import { Button, Field, Input, Select, Textarea } from "./ui";
import { AutosaveStatus } from "./autosave-status";
import { useAutosaveForm } from "./use-autosave-form";

export function QuestionEditorForm({
  examPublicId,
  question,
}: {
  examPublicId: string;
  question: QuestionRecord;
}) {
  const { formRef, status, isPending, handleChange, handleBlurCapture, handleManualSubmit } =
    useAutosaveForm({
      action: updateQuestionAction,
      successMessage: "Soal berhasil diupdate.",
    });

  return (
    <form
      ref={formRef}
      onSubmit={handleManualSubmit}
      onChange={handleChange}
      onBlurCapture={handleBlurCapture}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="examPublicId" value={examPublicId} />
      <input type="hidden" name="questionPublicId" value={question.publicId} />
      <Field label="Pertanyaan">
        <Textarea name="questionText" defaultValue={question.questionText} required />
      </Field>
      {question.type === "multiple_choice" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {optionKeys.map((key) => (
              <Field key={key} label={`Opsi ${key}`}>
                <Input
                  name={`option${key}`}
                  defaultValue={question.options.find((option) => option.key === key)?.text ?? ""}
                  required
                />
              </Field>
            ))}
          </div>
          <Field label="Jawaban benar">
            <Select name="correctAnswerKey" defaultValue={question.correctAnswerKey ?? "A"}>
              {optionKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
          </Field>
        </>
      ) : null}
      <Field label="Catatan guru">
        <Textarea
          name="teacherNotes"
          className="min-h-24"
          defaultValue={question.teacherNotes ?? ""}
        />
      </Field>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AutosaveStatus status={status} />
          <Button type="submit" disabled={isPending} aria-disabled={isPending} className="gap-2">
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Menyimpan soal..." : "Simpan sekarang"}
          </Button>
        </div>
      </div>
    </form>
  );
}
