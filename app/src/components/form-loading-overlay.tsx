"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, SendHorizonal, Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom";

export function FormLoadingOverlay({
  kind,
  title,
  description,
  steps,
}: {
  kind: "ai" | "submit";
  title: string;
  description: string;
  steps?: string[];
}) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <PendingOverlayContent
      kind={kind}
      title={title}
      description={description}
      steps={steps}
    />
  );
}

function PendingOverlayContent({
  kind,
  title,
  description,
  steps,
}: {
  kind: "ai" | "submit";
  title: string;
  description: string;
  steps?: string[];
}) {
  const resolvedSteps = useMemo(
    () =>
      steps && steps.length > 0
        ? steps
        : kind === "ai"
          ? ["Reading your prompt", "Building balanced questions", "Preparing the draft editor"]
          : ["Saving your answers", "Checking each response", "Preparing confirmation"],
    [kind, steps],
  );
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % resolvedSteps.length);
    }, 1700);

    return () => window.clearInterval(interval);
  }, [resolvedSteps]);

  const Icon = kind === "ai" ? Sparkles : SendHorizonal;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(255,255,255,0.72)] px-4 backdrop-blur-md">
      <div className="surface-card w-full max-w-md p-7 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--color-primary)] text-white shadow-[0_18px_36px_-18px_rgba(69,26,245,0.72)]">
              <Icon className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Processing
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>

          <div className="rounded-[24px] bg-[var(--color-surface)] p-5">
            <div className="flex items-end gap-3">
              <div className="loading-card h-14 w-16 rounded-[18px] bg-white shadow-[0_14px_32px_-22px_rgba(69,26,245,0.5)]" />
              <div className="loading-card h-18 w-16 rounded-[18px] bg-[rgba(69,26,245,0.12)] shadow-[0_14px_32px_-22px_rgba(69,26,245,0.5)]" />
              <div className="loading-card h-10 w-16 rounded-[18px] bg-white shadow-[0_14px_32px_-22px_rgba(69,26,245,0.5)]" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="loading-line h-2.5 w-full rounded-full bg-[rgba(69,26,245,0.18)]" />
              <div className="loading-line h-2.5 w-4/5 rounded-full bg-[rgba(69,26,245,0.14)]" />
              <div className="loading-line h-2.5 w-3/5 rounded-full bg-[rgba(69,26,245,0.1)]" />
            </div>
          </div>

          <div className="rounded-[20px] border border-[var(--color-border)] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {resolvedSteps[stepIndex]}
              </p>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Step {stepIndex + 1}/{resolvedSteps.length}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              {resolvedSteps.map((step, index) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    index <= stepIndex
                      ? "bg-[var(--color-primary)]"
                      : "bg-[rgba(69,26,245,0.1)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
