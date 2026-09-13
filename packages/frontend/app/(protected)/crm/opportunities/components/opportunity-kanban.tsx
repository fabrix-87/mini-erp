"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { OpportunityListItem, SalesStage } from "@mini-erp/shared";
import { updateOpportunityStageAction } from "@/actions/opportunity-actions";
import { OpportunityKanbanColumn } from "./opportunity-kanban-column";
import { OpportunityKanbanCard } from "./opportunity-kanban-card";
import { getOpportunityStageOptions } from "@/helpers/opportunity-helper";

interface OpportunityKanbanProps {
  opportunities: OpportunityListItem[];
}

const STAGE_ORDER: SalesStage[] = [
  "LEAD_QUALIFICATION",
  "PROSPECTING",
  "NEEDS_ANALYSIS",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "COMMITMENT",
];

/**
 * Kanban board for opportunities grouped by sales stage.
 * Drag a card to another column to trigger a stage update (optimistic).
 * @param opportunities - Full list of opportunities to render as cards
 */
export function OpportunityKanban({ opportunities }: OpportunityKanbanProps) {
  const t = useTranslations("crm.opportunities");
  const [items, setItems] = useState(opportunities);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columns = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage,
      label: getOpportunityStageOptions(t).find((o) => o.value === stage)?.label ?? stage,
      items: items.filter((o) => o.stage === stage),
      totalValue: items
        .filter((o) => o.stage === stage)
        .reduce((sum, o) => sum + Number(o.estimatedValue ?? 0), 0),
    }));
  }, [items, t]);

  const activeOpportunity = items.find((o) => o.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const opportunityId = active.id as string;
    const newStage = over.id as SalesStage;
    const current = items.find((o) => o.id === opportunityId);
    if (!current || current.stage === newStage) return;

    // Optimistic update
    const previousStage = current.stage;
    setItems((prev) => prev.map((o) => (o.id === opportunityId ? { ...o, stage: newStage } : o)));

    const result = await updateOpportunityStageAction(opportunityId, { stage: newStage });
    if (!result.success) {
      // Rollback
      setItems((prev) =>
        prev.map((o) => (o.id === opportunityId ? { ...o, stage: previousStage } : o)),
      );
      toast.error(result.error ?? t("kanban.stageUpdateError"));
    } else {
      toast.success(t("kanban.stageUpdateSuccess"));
    }
  }

  return (
    <DndContext
      id="opportunity-kanban"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <OpportunityKanbanColumn
            key={col.stage}
            stage={col.stage}
            label={col.label}
            items={col.items}
            totalValue={col.totalValue}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity && <OpportunityKanbanCard opportunity={activeOpportunity} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
