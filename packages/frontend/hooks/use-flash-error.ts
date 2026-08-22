"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export type FlashErrorType = "unauthorized" | "forbidden" | "not_found" | "session_expired";

export interface FlashError {
  type: FlashErrorType;
}

/**
 * Reads a `?flash=` query param on mount, shows a localised sonner toast,
 * then removes the param from the URL via `router.replace` to prevent
 * replay on refresh.
 *
 * Must be used inside NextIntlClientProvider.
 */
export function useFlashError(): void {
  const t = useTranslations("errors.flash");
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("flash");

  useEffect(() => {
    if (!raw) return;

    let flash: FlashError;
    try {
      flash = JSON.parse(decodeURIComponent(raw)) as FlashError;
    } catch {
      return;
    }

    toast.error(t(flash.type));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const clean = params.size > 0
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(clean, { scroll: false });
  }, [raw]);
}