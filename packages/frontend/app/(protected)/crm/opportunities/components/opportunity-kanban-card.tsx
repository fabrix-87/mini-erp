"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, CalendarClock, TrendingUp, UserRoundPlus } from "lucide-react";
import type { OpportunityListItem } from "@mini-erp/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigation } from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateIT } from "@/helpers/date-helper";
import { useTranslations } from "next-intl";

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

  const t = useTranslations("crm.opportunities");

  const isLeadOpportunity = Boolean(opportunity);

  const relatedCompanyName = isLeadOpportunity
    ? opportunity.lead?.companyName
    : opportunity.customer?.company.companyName;

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
        {/* Titolo + soggetto (Lead/Customer) + azienda + assegnatario */}
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium leading-tight">{opportunity.title}</span>

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Badge
              variant="secondary"
              className={
                isLeadOpportunity
                  ? "inline-flex shrink-0 items-center gap-1 border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "inline-flex shrink-0 items-center gap-1 border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              }
              aria-label={isLeadOpportunity ? t("form.lead") : t("form.customer")}
            >
              {isLeadOpportunity ? (
                <UserRoundPlus className="size-3" aria-hidden="true" />
              ) : (
                <Building2 className="size-3" aria-hidden="true" />
              )}
              {isLeadOpportunity ? t("form.lead") : t("form.customer")}
            </Badge>

            <span className="truncate text-muted-foreground">{relatedCompanyName ?? "—"}</span>

            {opportunity.assignedUserName && (
              <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground">
                <span aria-hidden="true">·</span>
                <TrendingUp className="size-3" aria-hidden="true" />
                <span className="truncate">{opportunity.assignedUserName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Valore stimato + probabilità */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            {formatCurrency(Number(opportunity.estimatedValue ?? 0))}
          </span>

          <Badge variant="outline" className="text-xs">
            {opportunity.probability}%
          </Badge>
        </div>

        {/* Data di chiusura prevista */}
        {opportunity.expectedCloseDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3" aria-hidden="true" />
            <span className="truncate">{formatDateIT(opportunity.expectedCloseDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
