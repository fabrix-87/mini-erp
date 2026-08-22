// lib/server/flash.ts
import type { FlashError } from "@/hooks/use-flash-error";

export type { FlashError };
export type { FlashErrorType } from "@/hooks/use-flash-error";

/**
 * Builds a redirect URL with a serialized FlashError as a `?flash=` param.
 * Use this in Server Components before calling `redirect()`.
 *
 * @param destination - Base redirect path (e.g. "/dashboard")
 * @param error - Structured error payload to flash as a toast on arrival
 * @returns Full URL string with `?flash=` param encoded
 *
 * @example
 * redirect(flashRedirect("/dashboard", { type: "unauthorized" }));
 */
export function flashRedirect(destination: string, error: FlashError): string {
  return `${destination}?flash=${encodeURIComponent(JSON.stringify(error))}`;
}
