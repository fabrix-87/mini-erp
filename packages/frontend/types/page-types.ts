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
  /** Used to infer a sensible default `variant` (e.g. "delete" -> destructive) when `variant` is not set. */
  intent?: PageHeaderActionIntent;
  visible?: boolean;
  disabled?: boolean;
  variant?: PageHeaderActionVariant;
  order?: number;
}
