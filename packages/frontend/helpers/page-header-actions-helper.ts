import { ActionResult } from "@/lib/server/action";
import { DeleteApiResponse } from "@/types/api";
import { PageHeaderAction, PageHeaderActionConfirm } from "@/types/page-types";

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

export function createExportAction(
  key: string,
  label: string,
  onClick: () => void | Promise<void>,
  visible: boolean = true,
  disabled: boolean = false,
): PageHeaderAction {
  return {
    key,
    label,
    onClick,
    visible,
    disabled,
    icon: "download",
    intent: "export",
    order: 30,
  };
}

export function createDeleteAction(
  key: string,
  label: string,
  onClick: () => void | Promise<void>,
  visible: boolean = true,
  disabled: boolean = false,
): PageHeaderAction {
  return {
    key,
    label,
    onClick,
    visible,
    disabled,
    icon: "trash",
    intent: "delete",
    order: 40,
  };
}
/**
 * Creates a delete action backed by a Server Action.
 * Use this variant when building the action list inside a Server Component,
 * where passing a plain `onClick` function would cross the serialization boundary.
 *
 * @param key     - Unique action key.
 * @param label   - Button label.
 * @param action  - Server Action to invoke on click.
 * @param confirm - Confirm dialog configuration.
 * @param visible - Whether the button is rendered.
 * @param disabled - Whether the button is disabled.
 */
export function createDeleteServerAction(
  key: string,
  label: string,
  action: () => Promise<ActionResult<DeleteApiResponse>>,
  confirm: PageHeaderActionConfirm,
  visible: boolean = true,
  disabled: boolean = false,
): PageHeaderAction {
  return {
    key,
    label,
    action,
    confirm,
    visible,
    disabled,
    icon: "trash",
    intent: "delete",
    order: 40,
  };
}
