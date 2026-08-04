import { PageHeaderAction } from "@/types/page-types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function createCreateAction(
  key: string,
  label: string,
  href: string,
  visible: boolean,
): PageHeaderAction {
  return {
    key,
    label,
    href,
    visible,
    icon: "plus",
    variant: "default",
    order: 10,
  };
}

export function createEditAction(
  key: string,
  label: string,
  href: string,
  visible: boolean,
): PageHeaderAction {
  return {
    key,
    label,
    href,
    visible,
    icon: "pencil",
    variant: "outline",
    order: 20,
  };
}
