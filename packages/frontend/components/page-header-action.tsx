"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeaderAction, PageHeaderActionIcon } from "@/types/page-types";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";

const ICON_MAP: Record<PageHeaderActionIcon, React.ComponentType<{ className?: string }>> = {
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  download: Download,
};

interface PageHeaderActionsProps {
  actions: PageHeaderAction[];
}

/**
 * Renders page header actions from a typed configuration array.
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
      {visibleActions.map((action) => {
        const Icon = action.icon ? ICON_MAP[action.icon] : null;
        const variant = action.variant ?? "default";

        if (action.href) {
          return (
            <Button key={action.key} asChild size="sm" variant={variant} className="h-8 text-xs">
              <Link href={action.href}>
                {Icon && <Icon className="mr-1 h-3 w-3" />}
                {action.label}
              </Link>
            </Button>
          );
        }

        return (
          <Button key={action.key} size="sm" variant={variant} className="h-8 text-xs">
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
