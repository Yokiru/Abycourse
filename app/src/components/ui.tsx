import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { getStatusLabel } from "@/lib/utils";
import type { ExamStatus } from "@/lib/types";

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance text-4xl font-semibold tracking-normal text-[var(--color-text)] md:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: PropsWithChildren<
  {
    href?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    className?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>) {
  const classes = clsx(
    "inline-flex min-h-11 items-center justify-center rounded-[14px] px-5 text-sm font-semibold",
    "focus:outline-none focus:ring-2 focus:ring-[rgba(69,26,245,0.22)]",
    {
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]":
        variant === "primary",
      "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]":
        variant === "secondary",
      "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-surface)]":
        variant === "ghost",
      "bg-[#8d1635] text-white hover:bg-[#73112b]": variant === "danger",
    },
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("surface-card p-6 md:p-8", className)}>{children}</section>;
}

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[var(--color-text)]">{label}</span>
      {children}
      {hint ? <span className="text-sm text-[var(--color-text-secondary)]">{hint}</span> : null}
    </label>
  );
}

const inputClasses =
  "min-h-12 w-full rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(69,26,245,0.12)]";

export function Input(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={clsx(inputClasses, props.className)} />;
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={clsx(
        `${inputClasses} min-h-32 resize-y py-3 leading-6`,
        props.className,
      )}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={clsx(inputClasses, "appearance-none", props.className)}
    />
  );
}

export function Divider() {
  return <div className="h-px w-full bg-[var(--color-border)]" />;
}

export function StatusPill({ status }: { status: ExamStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        {
          "bg-[rgba(69,26,245,0.1)] text-[var(--color-primary)]":
            status === "draft",
          "bg-[rgba(6,121,42,0.12)] text-[var(--color-secondary)]":
            status === "published",
          "bg-[rgba(0,0,0,0.08)] text-[var(--color-text-secondary)]":
            status === "closed",
        },
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-start gap-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      {action}
    </Card>
  );
}

export function Notice({
  tone,
  children,
}: PropsWithChildren<{ tone: "success" | "error" | "info" }>) {
  return (
    <div
      className={clsx(
        "rounded-[20px] border px-4 py-3 text-sm leading-6",
        {
          "border-[rgba(6,121,42,0.24)] bg-[rgba(6,121,42,0.08)] text-[var(--color-secondary)]":
            tone === "success",
          "border-[rgba(141,22,53,0.22)] bg-[rgba(141,22,53,0.08)] text-[#8d1635]":
            tone === "error",
          "border-[rgba(69,26,245,0.22)] bg-[rgba(69,26,245,0.08)] text-[var(--color-primary)]":
            tone === "info",
        },
      )}
    >
      {children}
    </div>
  );
}
