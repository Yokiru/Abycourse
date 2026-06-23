"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CopyPlus, LoaderCircle, Trash2 } from "lucide-react";
import {
  deleteQuestionAction,
  duplicateQuestionAction,
  moveQuestionAction,
  type InlineActionResult,
} from "@/app/actions";
import { Button } from "./ui";
import { useToast } from "./toast-provider";

type QuickActionKind = "up" | "down" | "duplicate" | "delete";

export function QuestionQuickActions({
  examPublicId,
  questionPublicId,
  compact = false,
}: {
  examPublicId: string;
  questionPublicId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<QuickActionKind | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function runAction(kind: QuickActionKind) {
    setPendingAction(kind);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("examPublicId", examPublicId);
      formData.set("questionPublicId", questionPublicId);

      let result: InlineActionResult;

      if (kind === "up" || kind === "down") {
        formData.set("direction", kind);
        result = await moveQuestionAction(formData);
      } else if (kind === "duplicate") {
        result = await duplicateQuestionAction(formData);
      } else {
        result = await deleteQuestionAction(formData);
      }

      setPendingAction(null);
      showToast({
        tone: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`flex flex-wrap gap-2 ${compact ? "justify-end" : ""}`}>
        <InlineActionButton
          label="Naik"
          pendingLabel="Naik..."
          icon={<ArrowUp className="h-4 w-4" />}
          active={pendingAction === "up" && isPending}
          onClick={() => runAction("up")}
          compact={compact}
        />
        <InlineActionButton
          label="Turun"
          pendingLabel="Turun..."
          icon={<ArrowDown className="h-4 w-4" />}
          active={pendingAction === "down" && isPending}
          onClick={() => runAction("down")}
          compact={compact}
        />
        <InlineActionButton
          label="Duplicate"
          pendingLabel="Duplicating..."
          icon={<CopyPlus className="h-4 w-4" />}
          active={pendingAction === "duplicate" && isPending}
          onClick={() => runAction("duplicate")}
          compact={compact}
        />
        <InlineActionButton
          label="Hapus"
          pendingLabel="Menghapus..."
          icon={<Trash2 className="h-4 w-4" />}
          active={pendingAction === "delete" && isPending}
          onClick={() => runAction("delete")}
          danger
          compact={compact}
        />
      </div>
    </div>
  );
}

function InlineActionButton({
  label,
  pendingLabel,
  icon,
  active,
  onClick,
  danger = false,
  compact = false,
}: {
  label: string;
  pendingLabel: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
  compact?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={`gap-2 ${compact ? "min-h-9 px-3 text-xs" : ""} ${danger ? "text-[#8d1635] hover:bg-transparent" : ""}`}
      onClick={onClick}
      disabled={active}
      aria-disabled={active}
    >
      {active ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {active ? pendingLabel : label}
    </Button>
  );
}
