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
  const sortedPaths = Object.keys(SECTION_NAMESPACE_MAP).sort(
    (a, b) => b.length - a.length
  );
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

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") ?? 
                   headersList.get("x-pathname") ?? "";

  // Always-loaded namespaces
  const [nav, common, errors] = await Promise.all([
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/errors.json`),
  ]);

  const messages: Record<string, unknown> = {
    nav: nav.default,
    common: common.default,
    errors: errors.default,
  };

  // Lazy-load section namespace derived from NAVIGATION_TREE
  const namespace = resolveNamespace(pathname);
  if (namespace && namespace !== "overview") {
    try {
      const sectionMessages = await import(`../messages/${locale}/${namespace}.json`);
      messages[namespace] = sectionMessages.default;
    } catch {
      // File not yet created for this namespace — silently skip
      console.warn(`[i18n] Missing messages file: ${locale}/${namespace}.json`);
    }
  }

  return { locale, messages };
});