"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitExamAttemptClientAction } from "@/app/actions";
import type { QuestionRecord } from "@/lib/types";
import { ActionStateOverlay } from "./action-state-overlay";
import { Button, Card, Textarea } from "./ui";
import { useToast } from "./toast-provider";

export function StudentAttemptForm({
  examSlug,
  attemptToken,
  questions,
}: {
  examSlug: string;
  attemptToken: string;
  questions: QuestionRecord[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setPhase("loading");
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await submitExamAttemptClientAction(formData);

      if (!result.ok) {
        setPhase("idle");
        showToast({ tone: "error", message: result.message });
        return;
      }

      showToast({ tone: "success", message: "Jawaban berhasil dikirim." });
      setPhase("success");

      window.setTimeout(() => {
        router.push(result.redirectTo ?? `/e/${examSlug}/submitted`);
      }, 900);
    });
  }

  return (
    <>
      <ActionStateOverlay
        kind="submit"
        phase={phase}
        loadingTitle="Jawabanmu sedang dikirim."
        loadingDescription="Sebentar ya, kami lagi menyimpan semua pilihan dan essay kamu supaya gurumu bisa langsung melihat hasilnya."
        successTitle="Jawabanmu sudah aman."
        successDescription="Kami sedang membuka halaman konfirmasi supaya kamu tahu submit-nya benar-benar masuk."
        steps={[
          "Saving your selected answers",
          "Checking each question payload",
          "Preparing your submit confirmation",
        ]}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="examSlug" value={examSlug} />
        <input type="hidden" name="attemptToken" value={attemptToken} />
        {questions.map((question, index) => (
          <Card key={question.publicId} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                Question {index + 1}
              </p>
              <h2 className="text-xl font-semibold">{question.questionText}</h2>
            </div>
            {question.type === "multiple_choice" ? (
              <div className="grid gap-3">
                {question.options.map((option) => (
                  <label
                    key={option.key}
                    className="flex min-h-12 items-center gap-3 rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-sm hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
                  >
                    <input
                      type="radio"
                      name={`question_${question.publicId}`}
                      value={option.key}
                      required
                    />
                    <span>
                      <span className="font-semibold">{option.key}.</span> {option.text}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <Textarea
                name={`question_${question.publicId}`}
                placeholder="Write your answer here"
                required
              />
            )}
          </Card>
        ))}
        <div className="pt-2">
          <Button type="submit" disabled={isPending} aria-disabled={isPending}>
            Submit Answers
          </Button>
        </div>
      </form>
    </>
  );
}
