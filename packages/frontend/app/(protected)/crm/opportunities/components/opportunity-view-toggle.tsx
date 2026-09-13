"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OpportunityView = "table" | "kanban";

interface OpportunityViewToggleProps {
  currentView: OpportunityView;
}

/**
 * Toggle between table and kanban view for the opportunities list page.
 * Persists the choice in the `view` search param.
 * @param currentView - The currently active view, derived from searchParams
 */
export function OpportunityViewToggle({ currentView }: OpportunityViewToggleProps) {
  const t = useTranslations("crm.opportunities");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(view: OpportunityView) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "table") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center rounded-md border p-0.5 bg-muted/50">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-1.5 px-2.5",
          currentView === "table" && "shadow-sm bg-primary text-primary-foreground",
        )}
        onClick={() => setView("table")}
        aria-label={t("view.table")}
      >
        <Table2 className="h-3.5 w-3.5" />
        <span className="text-xs">{t("view.table")}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-1.5 px-2.5",
          currentView === "kanban" && "shadow-sm bg-primary text-primary-foreground",
        )}
        onClick={() => setView("kanban")}
        aria-label={t("view.kanban")}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="text-xs">{t("view.kanban")}</span>
      </Button>
    </div>
  );
}