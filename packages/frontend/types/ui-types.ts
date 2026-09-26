// packages/frontend/types/ui-types.ts

/**
 * Represents an option displayed by a combobox.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

export * from './ui/toolbar-types'