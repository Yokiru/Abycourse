"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "./ui";

export function PrintExamActions({
  backHref,
  secondaryHref,
  secondaryLabel,
}: {
  backHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="print-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white/94 px-6 py-4 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
      <Button
        type="button"
        className="gap-2"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4" />
        Print / Save PDF
      </Button>
    </div>
  );
}
