"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { OpportunityListItem, SalesStage } from "@mini-erp/shared";
import { cn } from "@/lib/utils";
import { OpportunityKanbanCard } from "./opportunity-kanban-card";
import { formatCurrency } from "@/utils/format-currency";
import { getStageColorTokens } from "@/helpers/opportunity-helper";

interface OpportunityKanbanColumnProps {
  stage: SalesStage;
  label: string;
  items: OpportunityListItem[];
  totalValue: number;
}

/**
 * Droppable kanban column for a single sales stage.
 */
export function OpportunityKanbanColumn({
  stage,
  label,
  items,
  totalValue,
}: OpportunityKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const colors = getStageColorTokens(stage);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-60 flex-1 flex-col rounded-lg border border-t-4 transition-colors",
        colors.accent,
        colors.columnBg,
        isOver && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-t-md border-b px-3 py-2.5",
          colors.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
          <h3 className="text-sm font-medium">{label}</h3>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {items.length}
        </span>
      </div>

      <SortableContext items={items.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 p-2 min-h-50">
          {items.map((opp) => (
            <OpportunityKanbanCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
