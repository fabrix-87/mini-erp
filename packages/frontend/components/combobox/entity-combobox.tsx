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

/**
 * Shared entity selector props, including input accessibility and form bindings.
 */
export interface EntityComboboxProps<TItem> extends Pick<
  React.ComponentPropsWithRef<"input">,
  | "id"
  | "name"
  | "ref"
  | "onBlur"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-invalid"
  | "aria-required"
> {
  value?: string;

  /** Called with the selected entity ID, or an empty string when cleared. */
  onValueChange?: (value: string) => void;

  /** Called with the selected entity, or undefined when cleared. */
  onItemChange?: (item: TItem | undefined) => void;

  disabled?: boolean;
  className?: string;
  portalContainer?: React.ComponentProps<typeof ComboboxContent>["portalContainer"];
}

/**
 * Renders an async entity selector with searchable options and form bindings.
 * @param props - Data source configuration, selection callbacks, and input props.
 * @returns A searchable entity combobox connected to its input bindings.
 */
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
  ...inputProps
}: EntityComboboxConfig<TItem> & EntityComboboxProps<TItem>): React.JSX.Element {
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
        {...inputProps}
        placeholder={t(placeholderKey)}
        className={className}
        showClear
        disabled={disabled}
        onInput={(event) => {
          const search = event.currentTarget.value;

          // Avoid searching when the input displays the selected option label.
          if (selectedOption && search === selectedOption.label) {
            return;
          }

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
