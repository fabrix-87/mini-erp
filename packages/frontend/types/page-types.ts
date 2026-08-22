import { ActionResult } from "@/lib/server/action";
import { DeleteApiResponse } from "./api";

export interface PageIdProps {
  params: Promise<{ id: string }>;
}

export type PageHeaderActionIcon = "plus" | "pencil" | "trash" | "download";
export type PageHeaderActionIntent = "navigate" | "delete" | "export" | "custom";
export type PageHeaderActionVariant = "default" | "outline" | "secondary" | "ghost" | "destructive";

export interface PageHeaderAction {
  key: string;
  label: string;
  icon?: PageHeaderActionIcon;
  /** Navigates to this href when clicked. Takes precedence over `onClick` if both are set. */
  href?: string;
  /**
   * Executes this handler when clicked (ignored if `href` is set).
   * Return a Promise to get an automatic pending state: the button shows a
   * spinner and is disabled until it resolves, preventing double-submits
   * (e.g. delete, export).
   */
  onClick?: () => void | Promise<void>;
  /**
   * Server Action to invoke when clicked. Serializable across the
   * Server → Client boundary; use this when the parent is a Server Component.
   * Takes precedence over `onClick` when both are set.
   */
  action?: () => Promise<ActionResult<DeleteApiResponse>>;
  /**
   * Se presente, il click apre un dialog di conferma prima di eseguire
   * `action` o `onClick`. Ideale per azioni distruttive (delete).
   */
  confirm?: PageHeaderActionConfirm;
  /** Used to infer a sensible default `variant` (e.g. "delete" -> destructive) when `variant` is not set. */
  intent?: PageHeaderActionIntent;
  visible?: boolean;
  disabled?: boolean;
  variant?: PageHeaderActionVariant;
  order?: number;
}

/**
 * Configuration for the inline confirmation dialog shown before
 * executing a destructive or irreversible action.
 */
export interface PageHeaderActionConfirm {
  /** Dialog title, e.g. "Elimina cliente" */
  title: string;
  /** Dialog body content, e.g. "Questa operazione è irreversibile." */
  description: string;
  /** Confirm button label. Defaults to "Elimina" */
  confirmLabel?: string;
  /** Cancel button label. Defaults to "Annulla" */
  cancelLabel?: string;
}