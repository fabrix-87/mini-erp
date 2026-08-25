// packages/frontend/app/(protected)/crm/opportunities/components/opportunity-filters.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OpportunityQueryInput } from "@/types/opportunity-types";
import { OpportunitySource, OpportunityStatus, SalesStage } from "@mini-erp/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getRoute } from "@/lib/navigation-routes";
import { useUpdateURL } from "@/hooks/use-update-url";

interface OpportunityFiltersProps {
  searchParams: OpportunityQueryInput;
  onPendingChange?: (pending: boolean) => void;
}

/**
 * Compact filter toolbar for opportunities.
 * Synchronizes search and select filters with URL query params.
 */
export function OpportunityFilters({
  searchParams,
  onPendingChange,
}: OpportunityFiltersProps): React.ReactElement {
  const t = useTranslations("crm.opportunities");
  const [isPending, startTransition] = useTransition();
  const updateURL = useUpdateURL(getRoute("opportunities"));

  const [search, setSearch] = useState(searchParams.search ?? "");

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    setSearch(searchParams.search ?? "");
  }, [searchParams.search]);

  const applyFilters = (partial: Partial<OpportunityQueryInput>): void => {
    startTransition(() => {
      updateURL({
        ...searchParams,
        ...partial,
      });
    });
  };

  const handleSearchSubmit = (): void => {
    applyFilters({
      search: search.trim() || undefined,
    });
  };

  const handleReset = (): void => {
    setSearch("");
    startTransition(() => {
      updateURL({
        page: 1,
        search: undefined,
        status: undefined,
        stage: undefined,
        source: undefined,
        assignedUserId: undefined,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder,
        limit: searchParams.limit,
      });
    });
  };

  const hasActiveFilters = Boolean(
    searchParams.search ||
      searchParams.status ||
      searchParams.stage ||
      searchParams.source ||
      searchParams.assignedUserId,
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                placeholder={t("filters.searchPlaceholder")}
                className="pl-9"
                aria-label={t("filters.searchPlaceholder")}
              />
            </div>

            <Button type="button" variant="default" onClick={handleSearchSubmit} disabled={isPending}>
              {t("filters.search")}
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:w-auto">
            <Select
              value={searchParams.status ?? "__all__"}
              onValueChange={(value) =>
                applyFilters({
                  status: value === "__all__" ? undefined : (value as OpportunityStatus),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-45" aria-label={t("tableFields.status")}>
                <SelectValue placeholder={t("tableFields.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("filters.allStatuses")}</SelectItem>
                {Object.values(OpportunityStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchParams.stage ?? "__all__"}
              onValueChange={(value) =>
                applyFilters({
                  stage: value === "__all__" ? undefined : (value as SalesStage),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-55" aria-label={t("tableFields.stage")}>
                <SelectValue placeholder={t("tableFields.stage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("filters.allStages")}</SelectItem>
                {Object.values(SalesStage).map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {t(`stage.${stage.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchParams.source ?? "__all__"}
              onValueChange={(value) =>
                applyFilters({
                  source: value === "__all__" ? undefined : (value as OpportunitySource),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-45" aria-label={t("tableFields.source")}>
                <SelectValue placeholder={t("tableFields.source")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("filters.allSources")}</SelectItem>
                {Object.values(OpportunitySource).map((source) => (
                  <SelectItem key={source} value={source}>
                    {t(`source.${source.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasActiveFilters || isPending}
              className="shrink-0"
            >
              <X className="mr-2 h-4 w-4" />
              {t("filters.reset")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t("filters.helperText")}</span>
        </div>
      </CardContent>
    </Card>
  );
}