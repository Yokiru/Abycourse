"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  showToast: (input: { tone: ToastTone; message: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ tone, message }: { tone: ToastTone; message: string }) => {
      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setItems((current) => [...current, { id, tone, message }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] px-4 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss(item.id);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => window.removeEventListener("keydown", onEscape);
  }, [item.id, onDismiss]);

  const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? CircleAlert : Info;

  return (
    <div
      className={`toast-card pointer-events-auto ${
        item.tone === "success"
          ? "border-[rgba(6,121,42,0.22)] text-[var(--color-secondary)]"
          : item.tone === "error"
            ? "border-[rgba(141,22,53,0.22)] text-[#8d1635]"
            : "border-[rgba(69,26,245,0.22)] text-[var(--color-primary)]"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/75 p-1">
          <Icon className="h-4 w-4" />
        </div>
        <p className="flex-1 text-sm font-medium leading-6">{item.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="rounded-full p-1 text-current/70 hover:bg-white/60 hover:text-current"
          aria-label="Dismiss toast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
