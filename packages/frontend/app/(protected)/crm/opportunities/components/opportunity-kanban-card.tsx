"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock } from "lucide-react";
import type { OpportunityListItem } from "@mini-erp/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigation } from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateIT } from "@/helpers/date-helper";

interface OpportunityKanbanCardProps {
  opportunity: OpportunityListItem;
  isDragging?: boolean;
}

/**
 * Draggable card representing a single opportunity in the kanban board.
 */
export function OpportunityKanbanCard({ opportunity, isDragging }: OpportunityKanbanCardProps) {
  const { navigateToDetail } = useNavigation();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: opportunity.id,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && navigateToDetail("opportunities", opportunity.id)}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "shadow-lg opacity-90 rotate-1",
      )}
    >
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium leading-tight line-clamp-2">{opportunity.title}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatCurrency(Number(opportunity.estimatedValue ?? 0))}
          </span>
          <Badge variant="outline" className="text-xs">
            {opportunity.probability}%
          </Badge>
        </div>

        {opportunity.expectedCloseDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            {formatDateIT(opportunity.expectedCloseDate)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
