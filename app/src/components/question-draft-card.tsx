"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { QuestionRecord } from "@/lib/types";
import { Card } from "./ui";
import { QuestionEditorForm } from "./question-editor-form";
import { QuestionQuickActions } from "./question-quick-actions";

export function QuestionDraftCard({
  examPublicId,
  question,
  defaultOpen,
}: {
  examPublicId: string;
  question: QuestionRecord;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const node = contentRef.current;

    if (!node) {
      return;
    }

    const updateHeight = () => setContentHeight(node.scrollHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [question]);

  const summaryText = useMemo(() => {
    if (question.type === "multiple_choice") {
      return `Jawaban benar saat ini: ${question.correctAnswerKey ?? "-"}`;
    }

    return question.teacherNotes?.trim()
      ? "Essay ini punya catatan guru."
      : "Essay tanpa catatan tambahan.";
  }, [question]);

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
              #{question.orderIndex}
            </span>
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {question.type === "multiple_choice" ? "Pilihan ganda" : "Essay"}
            </span>
            <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
              {question.type === "multiple_choice"
                ? `${question.options.length} opsi`
                : "Jawaban panjang"}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-[var(--color-text)]">
              {question.questionText}
            </h3>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              {summaryText}
            </p>
          </div>
        </div>
        <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)]">
          <span>{open ? "Tutup" : "Buka"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden border-t border-[var(--color-border)] transition-[max-height,opacity] duration-500 ${
          open ? "opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]" : "opacity-0 ease-[cubic-bezier(0.4,0,1,1)]"
        }`}
        style={{ maxHeight: open ? `${contentHeight}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className={`space-y-5 px-6 py-6 transition-[transform,opacity] duration-500 ${
            open
              ? "translate-y-0 scale-[1] opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "-translate-y-1 scale-[0.985] opacity-0 ease-[cubic-bezier(0.4,0,1,1)]"
          }`}
          style={{ transformOrigin: "top center" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[var(--color-surface)] p-3">
            <div className="text-sm font-semibold text-[var(--color-text)]">
              Aksi cepat
            </div>
            <QuestionQuickActions
              examPublicId={examPublicId}
              questionPublicId={question.publicId}
              compact
            />
          </div>

          <QuestionEditorForm examPublicId={examPublicId} question={question} />
        </div>
      </div>
    </Card>
  );
}
