"use client";

import { CheckCircle2, LoaderCircle, SendHorizonal, Sparkles } from "lucide-react";

type OverlayPhase = "idle" | "loading" | "success";

export function ActionStateOverlay({
  kind,
  phase,
  loadingTitle,
  loadingDescription,
  successTitle,
  successDescription,
  steps,
}: {
  kind: "ai" | "submit";
  phase: OverlayPhase;
  loadingTitle: string;
  loadingDescription: string;
  successTitle: string;
  successDescription: string;
  steps?: string[];
}) {
  if (phase === "idle") {
    return null;
  }

  const Icon = phase === "success" ? CheckCircle2 : kind === "ai" ? Sparkles : SendHorizonal;
  const title = phase === "success" ? successTitle : loadingTitle;
  const description = phase === "success" ? successDescription : loadingDescription;
  const badgeLabel = phase === "success" ? "Berhasil" : "Memproses";
  const badgeClassName =
    phase === "success"
      ? "bg-[rgba(6,121,42,0.1)] text-[var(--color-secondary)]"
      : "bg-[var(--color-surface)] text-[var(--color-primary)]";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(255,255,255,0.72)] px-4 backdrop-blur-md">
      <div className="surface-card w-full max-w-md p-7 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-[0_18px_36px_-18px_rgba(69,26,245,0.72)] ${
                phase === "success" ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"
              }`}
            >
              <Icon className={`h-6 w-6 ${phase === "loading" ? "" : ""}`} />
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${badgeClassName}`}
            >
              {phase === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              {badgeLabel}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>

          {phase === "loading" ? (
            <>
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

              {steps && steps.length > 0 ? (
                <div className="rounded-[20px] border border-[var(--color-border)] bg-white px-4 py-4">
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(69,26,245,0.08)] text-xs font-semibold text-[var(--color-primary)]">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[24px] border border-[rgba(6,121,42,0.16)] bg-[rgba(6,121,42,0.06)] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-secondary)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-secondary)]">
                    Hampir selesai
                  </p>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Kami lanjutkan ke langkah berikutnya supaya flow terasa mulus.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
