import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { headers } from "next/headers";
import { SECTION_NAMESPACE_MAP } from "@/lib/navigation-config";

/**
 * Resolves the i18n namespace for the current request path.
 * Matches the longest section prefix to handle nested routes correctly.
 *
 * @param pathname - The current request pathname (e.g. "/finance/invoices")
 * @returns The namespace key (e.g. "finance"), or null if no section matches.
 */
function resolveNamespace(pathname: string): string | null {
  // Sort by length descending to match the most specific prefix first
  const sortedPaths = Object.keys(SECTION_NAMESPACE_MAP).sort((a, b) => b.length - a.length);
  const match = sortedPaths.find((path) => pathname.startsWith(path));
  return match ? SECTION_NAMESPACE_MAP[match] : null;
}

/**
 * Loads only the message namespaces required for the current page.
 * `nav` and `common` are always included; the section namespace is lazy-loaded
 * based on the current path, derived from NAVIGATION_TREE.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "it" | "en")) {
    locale = routing.defaultLocale;
  }

  // Load all namespaces upfront — avoids missing messages on client-side navigation
  const namespaces = ["nav", "common", "errors", "system", "crm", "finance", "admin", "overview"];

  const loaded = await Promise.all(
    namespaces.map((ns) =>
      import(`../messages/${locale}/${ns}.json`)
        .then((m) => [ns, m.default] as const)
        .catch(() => {
          console.warn(`[i18n] Missing: ${locale}/${ns}.json`);
          return [ns, {}] as const;
        })
    )
  );

  return {
    locale,
    timeZone: 'Europe/Rome',
    messages: Object.fromEntries(loaded),
  };
});

