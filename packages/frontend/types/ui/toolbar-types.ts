// types/ui/toolbar-types.ts
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Visual style of a toolbar button. */
export type ToolbarButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";

/** Controlled open state passed to a complete, domain-owned overlay. */
export interface ToolbarOverlayControls {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Confirmation prompt shown before an action executes. */
export interface ToolbarConfirmConfig {
  titleKey: string;
  descriptionKey: string;
  confirmLabelKey?: string;
  cancelLabelKey?: string;
  destructive?: boolean;
}

interface ToolbarButtonBase {
  key: string;
  labelKey: string;
  icon?: LucideIcon;
  iconOnly?: boolean;
  variant?: ToolbarButtonVariant;
  disabled?: boolean;
  hidden?: boolean;
  tooltipKey?: string;
  ariaLabelKey?: string;
}

/** Executes a synchronous or asynchronous callback. */
export interface ToolbarActionButtonConfig extends ToolbarButtonBase {
  type: "action";
  onClick: () => void | Promise<void>;
  confirm?: ToolbarConfirmConfig;
}

/** Navigates to a route or external URL. */
export interface ToolbarHrefButtonConfig extends ToolbarButtonBase {
  type: "href";
  href: string;
  target?: "_self" | "_blank";
  prefetch?: boolean;
}

/** Toolbar-owned dialog: accepts its body, never an entire Dialog. */
export interface ToolbarManagedModalButtonConfig extends ToolbarButtonBase {
  type: "modal";
  mode: "managed";
  modalTitleKey: string;
  modalDescriptionKey?: string;
  content: ReactNode;
}

/** Domain-owned dialog: receives open state and renders its own Dialog tree. */
export interface ToolbarCustomModalButtonConfig extends ToolbarButtonBase {
  type: "modal";
  mode: "custom";
  renderModal: (controls: ToolbarOverlayControls) => ReactNode;
}

/** Toolbar-owned sheet: accepts its body, never an entire Sheet. */
export interface ToolbarManagedSheetButtonConfig extends ToolbarButtonBase {
  type: "sheet";
  mode: "managed";
  sheetTitleKey: string;
  sheetDescriptionKey?: string;
  side?: "top" | "right" | "bottom" | "left";
  content: ReactNode;
}

/** Domain-owned sheet: receives open state and renders its own Sheet tree. */
export interface ToolbarCustomSheetButtonConfig extends ToolbarButtonBase {
  type: "sheet";
  mode: "custom";
  renderSheet: (controls: ToolbarOverlayControls) => ReactNode;
}

/** Every toolbar button has exactly one behavior. */
export type ToolbarButtonConfig =
  | ToolbarActionButtonConfig
  | ToolbarHrefButtonConfig
  | ToolbarManagedModalButtonConfig
  | ToolbarCustomModalButtonConfig
  | ToolbarManagedSheetButtonConfig
  | ToolbarCustomSheetButtonConfig;

/** Alignment of the button group within the toolbar row. */
export type ActionToolbarAlign = "start" | "end" | "between";

/** Props for the shared action toolbar. */
export interface ActionToolbarProps {
  buttons: readonly ToolbarButtonConfig[];
  className?: string;
  align?: ActionToolbarAlign;
  ariaLabelKey: string;
}
