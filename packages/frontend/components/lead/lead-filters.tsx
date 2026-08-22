// components/leads/lead-filters.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus, LeadSource, LeadQuality } from "@mini-erp/shared/constants";
import { useAppSearchParams } from "@/providers/search-params-provider";
import { useTranslations } from "next-intl";
import { getRoute } from "@/lib/navigation-routes";
import { LeadQueryInput } from "@mini-erp/shared";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "../ui/filter-bar";

// ============================================================================
// Helper
// ============================================================================

export type FilterStatus = LeadStatus | "ALL";
export type FilterSource = LeadSource | "ALL";
export type FilterQuality = LeadQuality | "ALL";

function getStatusOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterStatus[] = [
    "ALL",
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "UNQUALIFIED",
    "NURTURING",
    "CONVERTED",
    "LOST",
    "DUPLICATE",
    "ARCHIVED",
  ];
  return keys.map((value) => ({ value, label: t(`status.${value}`) }));
}

function getSourceOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterSource[] = [
    "ALL",
    "WEBSITE",
    "REFERRAL",
    "SOCIAL_MEDIA",
    "EMAIL_CAMPAIGN",
    "PHONE_CALL",
    "COLD_CALL",
    "EVENT",
    "PARTNER",
    "ADVERTISING",
    "CONTENT",
    "DIRECT",
    "CHAT",
    "OTHER",
  ];
  return keys.map((value) => ({ value, label: t(`source.${value}`) }));
}

function getQualityOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterQuality[] = ["ALL", "HOT", "WARM", "COLD"];
  return keys.map((value) => ({ value, label: t(`quality.${value}`) }));
}

// ============================================================================
// Component
// ============================================================================

interface Props {
  searchParams: LeadQueryInput;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  status: "ALL",
  source: "ALL",
  quality: "ALL",
};

/**
 * Lead list filters — search, status, source, quality.
 */
export function LeadFilters({ searchParams, onPendingChange }: Props) {
  const basePath = useMemo(() => getRoute("leads"), [getRoute]);
  const t = useTranslations("crm.leads");

  const LEAD_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("searchFilterPlaceholder"),
        debounceMs: 500,
        colSpan: 2,
      },
      {
        type: "select",
        key: "status",
        options: getStatusOptions(t),
      },
      {
        type: "select",
        key: "source",
        options: getSourceOptions(t),
      },
      {
        type: "select",
        key: "quality",
        options: getQualityOptions(t),
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    status: searchParams.status ?? DEFAULT_VALUES.status,
    source: searchParams.source ?? DEFAULT_VALUES.source,
    quality: searchParams.quality ?? DEFAULT_VALUES.quality,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={LEAD_FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
