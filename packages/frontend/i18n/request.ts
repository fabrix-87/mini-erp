import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Loads only the message namespaces required for the current page.
 * `nav` and `common` are always included; module-specific files are lazy-loaded.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "it" | "en")) {
    locale = routing.defaultLocale;
  }

  const [nav, common] = await Promise.all([
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/common.json`),
  ]);

  return {
    locale,
    messages: {
      nav: nav.default,
      common: common.default,
    },
  };
});