"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { InlineActionResult } from "@/app/actions";
import { useToast } from "./toast-provider";

export type AutosaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function serializeForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    params.append(key, String(value));
  }

  return params.toString();
}

export function useAutosaveForm({
  action,
  debounceMs = 1200,
  successMessage,
  onManualSuccess,
}: {
  action: (formData: FormData) => Promise<InlineActionResult>;
  debounceMs?: number;
  successMessage: string;
  onManualSuccess?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const queuedRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string>("");
  const statusRef = useRef<AutosaveState>("idle");
  const [status, setStatus] = useState<AutosaveState>("idle");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function setAutosaveStatus(nextStatus: AutosaveState) {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }

  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function scheduleSave(delay = debounceMs) {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const nextSnapshot = serializeForm(form);

    if (nextSnapshot === lastSavedSnapshotRef.current) {
      setAutosaveStatus("saved");
      return;
    }

    if (statusRef.current !== "saving") {
      setAutosaveStatus("dirty");
    }

    clearTimer();
    timeoutRef.current = setTimeout(() => {
      void runSave(false);
    }, delay);
  }

  async function runSave(manual: boolean) {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const snapshot = serializeForm(form);

    if (!manual && snapshot === lastSavedSnapshotRef.current) {
      setAutosaveStatus("saved");
      return;
    }

    clearTimer();

    if (isSavingRef.current) {
      queuedRef.current = true;
      return;
    }

    isSavingRef.current = true;
    queuedRef.current = false;
    setAutosaveStatus("saving");

    startTransition(async () => {
      const result: InlineActionResult = await action(new FormData(form));

      isSavingRef.current = false;

      if (result.ok) {
        lastSavedSnapshotRef.current = snapshot;
        setAutosaveStatus("saved");

        if (manual) {
          showToast({
            tone: "success",
            message: result.message || successMessage,
          });
          onManualSuccess?.();
        }
      } else {
        setAutosaveStatus("error");
        showToast({
          tone: "error",
          message: result.message,
        });
      }

      const currentForm = formRef.current;

      if (!currentForm) {
        return;
      }

      const currentSnapshot = serializeForm(currentForm);

      if (queuedRef.current || currentSnapshot !== lastSavedSnapshotRef.current) {
        queuedRef.current = false;
        scheduleSave(500);
      }
    });
  }

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    lastSavedSnapshotRef.current = serializeForm(form);
    setAutosaveStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  useEffect(() => {
    const shouldBlockLeave =
      statusRef.current === "dirty" ||
      statusRef.current === "saving" ||
      statusRef.current === "error";

    if (!shouldBlockLeave) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [status]);

  return {
    formRef,
    status,
    isPending,
    handleChange: () => {
      scheduleSave();
    },
    handleBlurCapture: () => {
      if (statusRef.current === "dirty") {
        void runSave(false);
      }
    },
    handleManualSubmit: (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void runSave(true);
    },
  };
}
