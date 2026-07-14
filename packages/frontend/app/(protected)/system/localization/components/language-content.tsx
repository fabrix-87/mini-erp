"use client";

import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { LanguageListApiResponse } from "@/types/language";
import { EntityPermissions, LanguageQueryInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageFilterBar } from "./language-filter-bar";
import { LanguageTable } from "./language-table";
import { DataPagination } from "@/components/ui/data-pagination";

interface LanguageContentProps {
  languagesList: LanguageListApiResponse;
  queryParams: LanguageQueryInput;
  permissions: EntityPermissions;
}

export default function LanguageContent({
  queryParams,
  languagesList,
  permissions,
}: LanguageContentProps) {
  const { data: languages, pagination } = languagesList;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbSetter title={t("system.localization.title")} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.languages')}</h1>
          <p className="text-muted-foreground">{t('system.localization.description')}</p>
        </div>
      </div>
      {/* Filter bar */}
      <LanguageFilterBar
        initialSearch={queryParams.search}
        initialSortBy={queryParams.sortBy}
        initialSortOrder={queryParams.sortOrder}
        onPendingChange={setIsLoading}
      />
      {/* Language list */}
      <LanguageTable languages={languages} isLoading={isLoading} />
      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={queryParams.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t("nav.languages")}
        />
      )}
    </div>
  );
}
