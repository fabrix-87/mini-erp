"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PageHeaderAction,
  PageHeaderActionIntent,
  PageHeaderActionVariant,
} from "@/types/page-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { AppIcon } from "./ui/app-icon";

/** Sensible default button variant per intent, used only when `variant` is not explicitly set. */
const INTENT_VARIANT_MAP: Record<PageHeaderActionIntent, PageHeaderActionVariant> = {
  navigate: "default",
  delete: "destructive",
  export: "outline",
  custom: "outline",
};

interface PageHeaderActionsProps {
  actions: PageHeaderAction[];
}

/**
 * Renders page header actions from a typed configuration array.
 * Supports both navigation actions (`href`) and imperative actions
 * (`onClick`), with an automatic pending state for async handlers.
 */
export function PageHeaderActions({ actions }: PageHeaderActionsProps): React.JSX.Element | null {
  const visibleActions = actions.filter((action) => action.visible !== false);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {visibleActions.map((action) => (
        <PageHeaderActionButton key={action.key} action={action} />
      ))}
    </div>
  );
}

function PageHeaderActionButton({ action }: { action: PageHeaderAction }): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const variant = action.variant ?? (action.intent ? INTENT_VARIANT_MAP[action.intent] : "default");

  // Navigation action: rendered as a Link, never carries a pending state.
  if (action.href) {
    return (
      <Button asChild size="sm" variant={variant} className={action.className ?? 'h-8'} disabled={action.disabled}>
        <Link href={action.href}>
          {action.icon && <AppIcon name={action.icon} className="mr-1 h-3 w-3" />}
          {action.label}
        </Link>
      </Button>
    );
  }

  const executeHandler = (): void => {
    const handler = action.action ?? action.onClick;
    if (!handler || isPending) return;
    startTransition(async () => {
      try {
        await handler();
      } catch (error) {
        console.error(`[PageHeaderActions] action "${action.key}" failed`, error);
      }
    });
  };

  const handleClick = (): void => {
    if (isPending) return;
    // Se c'è un dialog di conferma, aprilo invece di eseguire subito
    if (action.confirm) {
      setConfirmOpen(true);
      return;
    }
    executeHandler();
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className={cn(action.className ?? "h-8 text-xs", isPending && "cursor-wait")}
        disabled={action.disabled || isPending || (!action.onClick && !action.action)}
        aria-busy={isPending}
        onClick={handleClick}
      >
        {isPending ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          action.icon && <AppIcon name={action.icon} className="mr-1 h-3 w-3" />
        )}
        {action.label}
      </Button>

      {/* Dialog di conferma — renderizzato solo se `confirm` è definito */}
      {action.confirm && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action.confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{action.confirm.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {action.confirm.cancelLabel ?? "Annulla"}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault(); // evita la chiusura automatica durante il pending
                  executeHandler();
                  setConfirmOpen(false);
                }}
              >
                {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                {action.confirm.confirmLabel ?? "Elimina"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
