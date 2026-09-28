// packages/frontend/components/combobox/entity-combobox.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useEntityCombobox, type UseEntityComboboxOptions } from "@/hooks/use-entity-combobox";
import type { ComboboxOption } from "@/types/ui-types";

/// Per-entity configuration: data access, mapping and i18n keys.
export interface EntityComboboxConfig<TItem> extends Omit<
  UseEntityComboboxOptions<TItem>,
  "value"
> {
  placeholderKey: string;
  noResultsKey: string;
}

/// Props shared by every entity combobox.
export interface EntityComboboxProps<TItem> {
  value?: string;
  /// Fired with the selected ID. On clear: `""`.
  onValueChange?: (value: string) => void;
  /// Fired with the full entity returned by the API. On clear: `undefined`.
  onItemChange?: (item: TItem | undefined) => void;
  disabled?: boolean;
  className?: string;
  portalContainer?: React.ComponentProps<typeof ComboboxContent>["portalContainer"];
}

/// Generic async combobox with debounced search and selected-label restoration.
export function AsyncEntityCombobox<TItem>({
  value,
  onValueChange,
  onItemChange,
  disabled = false,
  className,
  portalContainer,
  useList,
  useSelected,
  toOption,
  placeholderKey,
  noResultsKey,
}: EntityComboboxConfig<TItem> & EntityComboboxProps<TItem>) {
  const t = useTranslations("ui");

  const { options, isLoading, onSearchChange, itemsByValue } = useEntityCombobox({
    value,
    useList,
    useSelected,
    toOption,
  });

  const selectedOption = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      itemToStringValue={(option: ComboboxOption) => option.label}
      value={selectedOption}
      onValueChange={(option) => {
        onValueChange?.(option?.value ?? "");
        onItemChange?.(option ? itemsByValue.get(option.value) : undefined);
      }}
      disabled={disabled}
      filter={null}
    >
      <ComboboxInput
        placeholder={t(placeholderKey)}
        className={className}
        showClear
        disabled={disabled}
        onInput={(e) => {
          const search = e.currentTarget.value;
          // Skip the search when the input just displays the selected label
          if (selectedOption && search === selectedOption.label) return;
          onSearchChange(search);
        }}
      />
      <ComboboxContent portalContainer={portalContainer}>
        <ComboboxEmpty>{isLoading ? t("loading") : t(noResultsKey)}</ComboboxEmpty>
        <ComboboxList>
          {(option: ComboboxOption) => (
            <ComboboxItem key={option.value} value={option}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
