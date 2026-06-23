"use client";

import { CheckCheck, CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import type { AutosaveState } from "./use-autosave-form";

export function AutosaveStatus({ status }: { status: AutosaveState }) {
  if (status === "idle") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
        <span>Autosave aktif</span>
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)]">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>Menyimpan perubahan...</span>
      </div>
    );
  }

  if (status === "dirty") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
        <span>Perubahan akan tersimpan otomatis</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-[#8d1635]">
        <CircleAlert className="h-4 w-4" />
        <span>Autosave gagal, coba simpan lagi</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm text-[var(--color-secondary)]">
      <CheckCheck className="h-4 w-4" />
      <span>Semua perubahan sudah tersimpan</span>
    </div>
  );
}
