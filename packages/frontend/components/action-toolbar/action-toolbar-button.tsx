// components/action-toolbar/action-toolbar-button.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { ToolbarButtonConfig } from "@/types/ui-types";

interface ActionToolbarButtonProps {
  config: ToolbarButtonConfig;
  onOpenOverlay: (key: string) => void;
}

/**
 * Renders one localized toolbar control and optionally a confirmation dialog.
 * @param props - Button definition and overlay trigger callback.
 * @returns A control, or null when hidden.
 */
export function ActionToolbarButton({
  config,
  onOpenOverlay,
}: ActionToolbarButtonProps): React.JSX.Element | null {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const [isPending, setIsPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (config.hidden) return null;
  const Icon = config.icon;
  const iconOnly = Boolean(config.iconOnly && Icon);
  const label = t(config.labelKey);
  const commonProps = {
    variant: config.variant ?? "default",
    size: iconOnly ? ("icon" as const) : ("sm" as const),
    title: config.tooltipKey ? t(config.tooltipKey) : label,
    "aria-label": config.ariaLabelKey ? t(config.ariaLabelKey) : label,
    className: "gap-1.5",
  };
  const content = (
    <>
      {Icon && <Icon className="size-4" aria-hidden="true" />}
      {!iconOnly && label}
    </>
  );

  if (config.type === "href") {
    if (config.disabled)
      return (
        <Button {...commonProps} disabled>
          {content}
        </Button>
      );
    return (
      <Button {...commonProps} asChild>
        <Link
          href={config.href}
          target={config.target}
          rel={config.target === "_blank" ? "noopener noreferrer" : undefined}
          prefetch={config.prefetch}
        >
          {content}
        </Link>
      </Button>
    );
  }

  if (config.type === "modal" || config.type === "sheet") {
    return (
      <Button {...commonProps} disabled={config.disabled} onClick={() => onOpenOverlay(config.key)}>
        {content}
      </Button>
    );
  }

  /** Runs the action once, showing pending feedback and reporting failures. */
  const runAction = async (): Promise<void> => {
    if (isPending) return;
    try {
      setIsPending(true);
      await config.onClick();
    } catch {
      toast.error(tCommon("actions.genericError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        {...commonProps}
        disabled={config.disabled || isPending}
        aria-busy={isPending}
        onClick={() => {
          if (config.confirm) setConfirmOpen(true);
          else void runAction();
        }}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : content}
        {isPending && !iconOnly && label}
      </Button>
      {config.confirm && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(config.confirm.titleKey)}</AlertDialogTitle>
              <AlertDialogDescription>{t(config.confirm.descriptionKey)}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {config.confirm.cancelLabelKey
                  ? t(config.confirm.cancelLabelKey)
                  : tCommon("actions.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(
                  config.confirm.destructive &&
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                )}
                onClick={() => void runAction()}
              >
                {config.confirm.confirmLabelKey
                  ? t(config.confirm.confirmLabelKey)
                  : tCommon("actions.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
