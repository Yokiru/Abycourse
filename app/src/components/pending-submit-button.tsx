"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui";

export function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={pending}
      aria-disabled={pending}
    >
      <span className="inline-flex items-center gap-2">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {pending ? pendingLabel : idleLabel}
      </span>
    </Button>
  );
}
