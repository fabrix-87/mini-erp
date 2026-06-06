// components/providers/translation-provider.tsx
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

interface TranslationProviderProps {
  namespace: string;
  children: React.ReactNode;
}

/**
 * Server Component that lazily loads a single i18n namespace
 * and injects it into the NextIntl context via a nested provider.
 *
 * @param namespace - The message namespace to load (must match a file in `messages/{locale}/{namespace}.json`)
 * @param children - The page/component tree that will consume the translations
 */
export default async function TranslationProvider({
  namespace,
  children,
}: TranslationProviderProps) {
  const locale = await getLocale();
  const messages = (await import(`@/messages/${locale}/${namespace}.json`)).default;

  return (
    <NextIntlClientProvider messages={{ [namespace]: messages }}>{children}</NextIntlClientProvider>
  );
}
