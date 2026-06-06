import { defineRouting } from "next-intl/routing";

/**
 * Defines supported locales and routing strategy.
 * No URL prefix — locale is resolved via cookie/Accept-Language header.
 */
export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
  localePrefix: "never", // nessun /it/ nell'URL
});