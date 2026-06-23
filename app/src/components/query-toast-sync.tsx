"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast-provider";

export function QueryToastSync() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const lastShownRef = useRef<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (!success && !error) {
      return;
    }

    const signature = `${pathname}|${success ?? ""}|${error ?? ""}`;

    if (lastShownRef.current === signature) {
      return;
    }

    lastShownRef.current = signature;

    if (success) {
      showToast({ tone: "success", message: success });
    }

    if (error) {
      showToast({ tone: "error", message: error });
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("success");
    nextParams.delete("error");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, showToast]);

  return null;
}
