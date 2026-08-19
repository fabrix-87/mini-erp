"use client";

import { CustomerQueryInput, CustomerStats } from "@mini-erp/shared";
import { CompanyListStats } from "../company-list-stats";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";

interface Props {
  searchParams: CustomerQueryInput;
  stats: CustomerStats;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  type: "all",
  segment: "all",
};

export default function CustomerHeaderListPage({
  searchParams,
  stats,
  onPendingChange,
}: Props) {
  const t = useTranslations("crm.customers");
  const basePath = useMemo(() => getRoute("customers"), [getRoute]);

  // ── Field config ─────────────────────────────────────────────────────────────
  const CUSTOMER_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
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
        key: "type",
        placeholder: t("type"),
        options: [
          { label: t("typeFilterAll"), value: "all" },
          { label: t("typeFilterProspect"), value: "PROSPECT" },
          { label: t("typeFilterCustomer"), value: "CUSTOMER" },
          { label: t("typeFilterPartner"), value: "PARTNER" },
          { label: t("typeFilterOther"), value: "OTHER" },
        ],
      },
      {
        type: "select",
        key: "segment",
        placeholder: t("segment"),
        options: [
          { label: t("segmentAll"), value: "all" },
          { label: t("segmentVip"), value: "VIP" },
          { label: t("segmentGold"), value: "GOLD" },
          { label: t("segmentSilver"), value: "SILVER" },
          { label: t("segmentBronze"), value: "BRONZE" },
          { label: t("segmentStandard"), value: "STANDARD" },
        ],
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    type: searchParams.type ?? DEFAULT_VALUES.type,
    segment: searchParams.segment ?? DEFAULT_VALUES.segment,
  };

  return (
    <>
      {/* Stats */}
      <CompanyListStats type="CUSTOMER" stats={stats} />

      {/* Filters */}
      <FilterBar
        basePath={basePath}
        defaultValues={DEFAULT_VALUES}
        fields={CUSTOMER_FILTER_FIELDS}
        initialValues={initialValues}
        onPendingChange={onPendingChange}
      />
    </>
  );
}
