import { useLocale } from "next-intl";
import { Locale as DateFnsLocale } from "date-fns";
import { it, enUS, fr, de, es } from "date-fns/locale";

const dateFnsLocales: Record<string, DateFnsLocale> = {
  it,
  en: enUS,
  fr,
  de,
  es,
};

/**
 * Hook Client che restituisce sia la stringa del locale sia l'oggetto compatibile con date-fns / Shadcn UI.
 */
export function useCurrentDateFnsLocale(): {
  localeStr: string;
  dateFnsLocale: DateFnsLocale;
} {
  const localeStr = useLocale();
  const dateFnsLocale = dateFnsLocales[localeStr] || it;

  return { localeStr, dateFnsLocale };
}
