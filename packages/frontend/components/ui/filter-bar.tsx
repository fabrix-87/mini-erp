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
import { useNavigation } from "@/hooks/use-navigation";

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
  const isFirstRender = useRef(true);

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
    if (isFirstRender.current) return;
    onPendingChange(isPending);
  }, [isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search refs ─────────────────────────────────────────────────
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  // ── Skip effects on first render ──────────────────────────────────────────
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const renderField = (field: FilterFieldConfig, index: number) => {
    if (field.type === "search") {
      return (
        <div key={field.key} className={`relative ${field.colSpan !== 1 ? "sm:col-span-2" : ""}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={field.placeholder}
            value={values[field.key] ?? ""}
            onChange={(e) => handleChange(field.key, e.target.value, field.debounceMs ?? 500)}
            className="pl-9"
            disabled={isPending}
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <Select
          key={field.key}
          value={values[field.key] ?? ""}
          onValueChange={(v) => handleChange(field.key, v === "all" ? "" : v)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "sort") {
      return (
        <div key={`sort-${index}`} className="flex gap-2">
          <Select
            value={values[field.sortByKey] ?? field.defaultSortBy}
            onValueChange={(v) => handleSortChange(field.sortByKey, v)}
            disabled={isPending}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={values[field.sortOrderKey] ?? field.defaultSortOrder}
            onValueChange={(v) => handleSortChange(field.sortOrderKey, v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">↑ Asc</SelectItem>
              <SelectItem value="desc">↓ Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{fields.map(renderField)}</div>
      </div>
    </div>
  );
}
