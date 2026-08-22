"use client";

import { Suspense } from "react";
import { useFlashError } from "@/hooks/use-flash-error";

/**
 * Inner component that consumes the flash error hook.
 * Separated to allow Suspense wrapping required by useSearchParams.
 */
function FlashErrorInner(): null {
  useFlashError();
  return null;
}

/**
 * Invisible client component that reads `?flash=` query params and shows
 * the appropriate sonner toast, then clears the URL.
 *
 * Must be placed inside NextIntlClientProvider (required by useTranslations).
 * Already handles the Suspense boundary required by useSearchParams.
 */
export function FlashErrorHandler(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <FlashErrorInner />
    </Suspense>
  );
}
