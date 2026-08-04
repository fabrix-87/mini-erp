"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PageHeaderAction,
  PageHeaderActionIcon,
  PageHeaderActionIntent,
  PageHeaderActionVariant,
} from "@/types/page-types";

const ICON_MAP: Record<PageHeaderActionIcon, React.ComponentType<{ className?: string }>> = {
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  download: Download,
};

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
  const visibleActions = actions
    .filter((action) => action.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
  const Icon = action.icon ? ICON_MAP[action.icon] : null;
  const variant = action.variant ?? (action.intent ? INTENT_VARIANT_MAP[action.intent] : "default");

  // Navigation action: rendered as a Link, never carries a pending state.
  if (action.href) {
    return (
      <Button
        asChild
        size="sm"
        variant={variant}
        className="h-8 text-xs"
        disabled={action.disabled}
      >
        <Link href={action.href}>
          {Icon && <Icon className="mr-1 h-3 w-3" />}
          {action.label}
        </Link>
      </Button>
    );
  }

  const handleClick = (): void => {
    if (!action.onClick || isPending) return;

    startTransition(async () => {
      try {
        await action.onClick!();
      } catch (error) {
        console.error(`[PageHeaderActions] action "${action.key}" failed`, error);
      }
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={cn("h-8 text-xs", isPending && "cursor-wait")}
      disabled={action.disabled || isPending || !action.onClick}
      aria-busy={isPending}
      onClick={handleClick}
    >
      {isPending ? (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      ) : (
        Icon && <Icon className="mr-1 h-3 w-3" />
      )}
      {action.label}
    </Button>
  );
}
