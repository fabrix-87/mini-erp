import { LucideIcon } from "lucide-react";

export interface PageIdProps {
  params: Promise<{ id: string }>;
}

export type PageHeaderActionIcon = "plus" | "pencil" | "trash" | "download";
export type PageHeaderActionIntent = "navigate" | "delete" | "export" | "custom";

export interface PageHeaderAction {
  key: string;
  label: string;
  icon?: PageHeaderActionIcon;
  href?: string;
  intent?: PageHeaderActionIntent;
  visible?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  order?: number;
}
