import { FilterBar } from "@/components/filter-bar";
import {
  getActivityOutcomeOptions,
  getActivityPriorityOptions,
  getActivityStatusOptions,
  getActivityTypeOptions,
} from "@/helpers/activity-helpers";
import { toDateInput } from "@/helpers/date-helper";
import { useNavigation } from "@/hooks/use-navigation";
import { FilterFieldConfig } from "@/types/filter-types";
import { ActivityQueryInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface ActivityFilterBarProps {
  filters: ActivityQueryInput;
  onPendingChange: (isPending: boolean) => void;
}

export default function ActivityFilterBar({ filters, onPendingChange }: ActivityFilterBarProps) {
  const { getRoute } = useNavigation();
  const basePath = useMemo(() => getRoute("activities"), [getRoute]);
  const t = useTranslations("activities");
  const tc = useTranslations("common");

  const startDate = filters.startDate ? toDateInput(filters.startDate) : "";
  const endDate = filters.endDate ? toDateInput(filters.endDate) : "";

  const DEFAULT_VALUES = {
    search: "",
    type: "ALL",
    status: "ALL",
    priority: "ALL",
    outcome: "ALL",
    overdue: "ALL",
    myActivities: "ALL",
    startDate,
    endDate
  };

  const ACTIVITY_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("filters.search.placeholder"),
        label: t("filters.search.label"),
        debounceMs: 500,
      },
      {
        type: "date",
        key: "startDate",
        label: t("filters.startDate.label"),
        placeholder: t("filters.startDate.placeholder"),
        max: endDate || undefined,
      },
      {
        type: "date",
        key: "endDate",
        label: t("filters.endDate.label"),
        placeholder: t("filters.endDate.placeholder"),
        min: startDate || undefined,
      },
      {
        type: "select",
        key: "type",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("form.type"),
        options: getActivityTypeOptions(t, true),
      },
      {
        type: "select",
        key: "status",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("form.status"),
        options: getActivityStatusOptions(t, true),
      },
      {
        type: "select",
        key: "priority",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("form.priority"),
        options: getActivityPriorityOptions(t, true),
      },
      {
        type: "select",
        key: "outcome",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("form.outcome"),
        options: getActivityOutcomeOptions(t, true),
      },
      {
        type: "select",
        key: "overdue",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("stats.overdue"),
        options: [
          {
            label: tc("all"),
            value: "ALL",
            default: true,
          },
          {
            label: tc("yes"),
            value: "true",
          },
          {
            label: tc("no"),
            value: "false",
          },
        ],
      },
      {
        type: "select",
        key: "myActivities",
        //placeholder: t("activeFilterPlaceholder"),
        label: t("filters.myActivities.label"),
        options: [
          {
            label: tc("all"),
            value: "ALL",
            default: true,
          },
          {
            label: tc("yes"),
            value: "true",
          },
          {
            label: tc("no"),
            value: "false",
          },
        ],
      },
    ],
    [t, tc, startDate, endDate],
  );

  const initialValues = {
    search: filters.search ?? DEFAULT_VALUES.search,
    type: filters.type ?? DEFAULT_VALUES.type,
    status: filters.status ?? DEFAULT_VALUES.status,
    priority: filters.priority ?? DEFAULT_VALUES.priority,
    outcome: filters.outcome ? String(filters.outcome) : DEFAULT_VALUES.outcome,
    overdue: filters.overdue ? String(filters.overdue) : DEFAULT_VALUES.overdue,
    myActivities: filters.myActivities ? String(filters.myActivities) : DEFAULT_VALUES.myActivities,
    startDate,
    endDate,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={ACTIVITY_FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
