"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/helpers/date-helper";
import { Language } from "@mini-erp/shared";
import { useLocale, useTranslations } from "next-intl";

interface LanguageTableProps {
  languages: Language[];
  isLoading: boolean;
}

/**
 * Renders a paginated table of languages
 *
 * @param languages - Array of {@link Language} entities to display
 * @param isLoading  - When true, shows a loading spinner instead of rows
 */
export function LanguageTable({ languages, isLoading }: LanguageTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("common.table.loading")}
        </div>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">{t("common.table.no_results")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("common.table.try_to_change_search_term")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("system.localization.id")}</TableHead>
              <TableHead>{t("system.localization.name")}</TableHead>
              <TableHead>{t("system.localization.isoCode")}</TableHead>
              <TableHead>{t("system.localization.languageCode")}</TableHead>
              <TableHead>{t("system.localization.createdAt")}</TableHead>
              <TableHead>{t("system.localization.updatedAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.map((language) => {
              return (
                <TableRow key={language.id} className="group">
                  <TableCell className="font-mono font-medium">{language.id}</TableCell>
                  <TableCell className="text-muted-foreground">{language.name}</TableCell>
                  <TableCell className="font-mono font-medium">{language.isoCode}</TableCell>
                  <TableCell className="font-mono font-medium">{language.languageCode}</TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatDate(language.createdAt, locale)}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatDate(language.updatedAt, locale)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
