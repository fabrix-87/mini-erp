"use client";

import { useTransition, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Filter, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateURL } from "@/hooks/use-update-url";
import { FilterFieldConfig } from "@/types/filter-types";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

// ============================================================================
// Types
// ============================================================================

/** Initial values map: field key → string value */
export type FilterInitialValues = Record<string, string>;

/** Default values map used to detect "dirty" filters */
export type FilterDefaultValues = Record<string, string>;

export interface FilterBarProps {
  /** Route base path, bound to useUpdateURL */
  basePath: string;
  /** Declarative field configuration */
  fields: FilterFieldConfig[];
  /** Initial values from URL search params */
  initialValues?: FilterInitialValues;
  /**
   * Default values used to determine if any filter is active.
   * Keys must match field `key` / `sortByKey` / `sortOrderKey`.
   */
  defaultValues?: FilterDefaultValues;
  /** Whether to show a create button */
  canCreate?: boolean;
  /** Callback fired whenever a navigation transition starts/ends */
  onPendingChange: (isPending: boolean) => void;
  handleNewClick?: () => void;
  newButtonText?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Generic declarative filter bar.
 * Renders search inputs, selects, and sort pairs based on `fields` config.
 * Syncs all filter state to the URL via `useUpdateURL`.
 *
 * @example
 * <FilterBar
 *   basePath={getRoute("users")}
 *   fields={USER_FILTER_FIELDS}
 *   initialValues={{ search: "foo", sortBy: "email", sortOrder: "asc" }}
 *   defaultValues={{ sortBy: "createdAt", sortOrder: "desc" }}
 *   onPendingChange={setIsPending}
 * />
 */
export function FilterBar({
  basePath,
  fields,
  canCreate = false,
  initialValues = {},
  defaultValues = {},
  onPendingChange,
  handleNewClick,
  newButtonText,
}: FilterBarProps) {
  const updateURL = useUpdateURL(basePath);
  const [isPending, startTransition] = useTransition();

  // ── State: one entry per key across all fields ──────────────────────────
  const allKeys = useMemo(
    () => fields.flatMap((f) => (f.type === "sort" ? [f.sortByKey, f.sortOrderKey] : [f.key])),
    [fields],
  );

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(allKeys.map((k) => [k, initialValues[k] ?? ""])),
  );

  // ── Propagate isPending to parent ────────────────────────────────────────
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  // ── Debounced search refs ─────────────────────────────────────────────────
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /**
   * Cancels pending debounced URL updates when the filter bar unmounts.
   */
  useEffect(() => {
    return (): void => {
      Object.values(searchTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  /**
   * Updates a single key in local state and pushes to URL.
   * Search fields are debounced; all others update immediately.
   */
  const handleChange = useCallback(
    (key: string, value: string, debounceMs = 0, extraOptions = {}) => {
      setValues((prev) => ({ ...prev, [key]: value }));

      if (debounceMs > 0) {
        clearTimeout(searchTimers.current[key]);
        searchTimers.current[key] = setTimeout(() => {
          startTransition(() => {
            updateURL(
              { [key]: value || null },
              { replace: true, resetPage: true, ...extraOptions },
            );
          });
        }, debounceMs);
      } else {
        startTransition(() => {
          updateURL({ [key]: value || null }, { replace: true, resetPage: true, ...extraOptions });
        });
      }
    },
    [updateURL],
  );

  /**
   * Handles sort field + order change together.
   * resetPage is false for sort changes (consistent with original behaviour).
   */
  const handleSortChange = useCallback(
    (key: string, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      startTransition(() => {
        updateURL({ [key]: value }, { replace: true });
      });
    },
    [updateURL],
  );

  /** Resets all filters to their default values. */
  const handleClearFilters = useCallback(() => {
    const reset = Object.fromEntries(allKeys.map((k) => [k, defaultValues[k] ?? ""]));
    setValues(reset);
    startTransition(() => {
      updateURL({}, { clearAll: true, replace: true });
    });
  }, [allKeys, defaultValues, updateURL]);

  // ── Dirty check ───────────────────────────────────────────────────────────
  const hasActiveFilters = useMemo(
    () => allKeys.some((k) => values[k] !== (defaultValues[k] ?? "")),
    [allKeys, values, defaultValues],
  );

  /**
   * Renders a declarative filter control with an optional label.
   * @param field - Filter field configuration.
   * @param index - Field index, used to create a stable sort key.
   * @returns Filter control markup.
   */
  const renderField = (field: FilterFieldConfig, index: number): React.ReactNode => {
    const fieldId = field.type === "sort" ? `filter-sort-${index}` : `filter-${field.key}`;
    const labelId = `${fieldId}-label`;

    const label = field.label ? (
      <span
        id={labelId}
        className="truncate text-xs font-medium leading-none text-muted-foreground"
      >
        {field.label}
      </span>
    ) : null;

    switch (field.type) {
      case "search":
        return (
          <div
            key={field.key}
            className={
              (field.colSpan ?? 1) > 1
                ? "flex min-w-50 flex-[2_1_20rem] flex-col gap-1.5"
                : "flex min-w-35 flex-1 flex-col gap-1.5"
            }
          >
            {label}

            <InputGroup className="w-full">
              <InputGroupInput
                id={fieldId}
                type="search"
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  handleChange(field.key, event.target.value, field.debounceMs ?? 500)
                }
                disabled={isPending}
                title={field.placeholder}
                aria-label={field.label ?? field.placeholder}
              />
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="flex min-w-36 flex-col gap-1.5">
            {label}

            <Select
              value={values[field.key] ?? ""}
              onValueChange={(value) => handleChange(field.key, value === "all" ? "" : value)}
              disabled={isPending}
              defaultValue={field.options.find((option) => option.default)?.value}
            >
              <SelectTrigger
                className="w-full min-w-36"
                aria-label={field.label ?? field.placeholder}
                aria-labelledby={field.label ? labelId : undefined}
              >
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "number":
        return (
          <div key={field.key} className="flex min-w-32 flex-col gap-1.5">
            {label}

            <Input
              id={fieldId}
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step={field.step ?? "any"}
              value={values[field.key] ?? ""}
              onChange={(event) => handleChange(field.key, event.target.value, 300)}
              placeholder={field.placeholder}
              disabled={isPending}
              title={field.placeholder}
              className="w-full"
              aria-label={field.label ?? field.placeholder}
            />
          </div>
        );

      case "sort":
        return (
          <div key={`sort-${index}`} className="flex min-w-60 flex-col gap-1.5">
            {label}

            <div className="flex gap-2">
              <Select
                value={values[field.sortByKey] ?? field.defaultSortBy}
                onValueChange={(value) => handleSortChange(field.sortByKey, value)}
                disabled={isPending}
              >
                <SelectTrigger
                  className="min-w-0 flex-1"
                  aria-label={field.label ?? "Ordinamento"}
                  aria-labelledby={field.label ? labelId : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={values[field.sortOrderKey] ?? field.defaultSortOrder}
                onValueChange={(value) => handleSortChange(field.sortOrderKey, value)}
                disabled={isPending}
              >
                <SelectTrigger className="w-25" aria-label="Direzione ordinamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑ Asc</SelectItem>
                  <SelectItem value="desc">↓ Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // JSX
  // ============================================================================

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Filtri</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Attivi
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Reimposta
              </Button>
            )}
            {canCreate && handleNewClick && (
              <Button size="sm" className="h-8 text-xs" onClick={handleNewClick}>
                <Plus className="h-3 w-3 mr-1" />
                {newButtonText ?? "Nuovo"}
              </Button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Left: search, select and number fields */}
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            {fields.filter((field) => field.type !== "sort").map(renderField)}
          </div>

          {/* Right: sort fields */}
          <div className="flex shrink-0 flex-wrap items-end gap-3">
            {fields
              .filter((field) => field.type === "sort")
              .map((field, index) => renderField(field, index))}
          </div>
        </div>
      </div>
    </div>
  );
}
