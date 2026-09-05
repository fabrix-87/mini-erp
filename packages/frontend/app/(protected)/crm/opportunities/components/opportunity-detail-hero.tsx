// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-hero.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CalendarCheck } from "lucide-react";
import type { OpportunityComplete } from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";

/** Maps SalesStage to a human-readable Italian label */
const STAGE_LABELS: Record<string, string> = {
  LEAD_QUALIFICATION: "Qualificazione",
  PROSPECTING: "Prospecting",
  NEEDS_ANALYSIS: "Analisi bisogni",
  PROPOSAL_SENT: "Offerta inviata",
  NEGOTIATION: "Negoziazione",
  COMMITMENT: "Impegno",
};

/** Maps OpportunityStatus to badge variant */
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  WON: "default",
  LOST: "destructive",
  PENDING: "secondary",
  CLOSED: "outline",
};

interface OpportunityDetailHeroProps {
  opportunity: OpportunityComplete;
}

/**
 * Hero KPI card for the opportunity detail page.
 * Shows estimated value, probability, stage, days in stage, and expected close date.
 */
export function OpportunityDetailHero({ opportunity }: OpportunityDetailHeroProps) {
  const estimatedValue = opportunity.estimatedValue
    ? Number(opportunity.estimatedValue).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      })
    : "—";

  const weightedValue = opportunity.weightedValue
    ? Number(opportunity.weightedValue).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      })
    : "—";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {/* Valore stimato */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Valore stimato
            </p>
            <p className="text-xl font-bold tabular-nums">{estimatedValue}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ponderato: {weightedValue}
            </p>
          </div>

          {/* Probabilità */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Probabilità
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xl font-bold tabular-nums">{opportunity.probability}%</p>
            </div>
            <Badge variant={STATUS_VARIANT[opportunity.status] ?? "outline"} className="mt-1 text-xs">
              {opportunity.status}
            </Badge>
          </div>

          {/* Stage */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stage</p>
            <p className="text-sm font-medium">
              {STAGE_LABELS[opportunity.stage] ?? opportunity.stage}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{opportunity.daysInCurrentStage} giorni in questo stage</span>
            </div>
          </div>

          {/* Chiusura prevista */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Chiusura prevista
            </p>
            {opportunity.expectedCloseDate ? (
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{formatDateIT(opportunity.expectedCloseDate)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Non definita</p>
            )}
            {opportunity.assignedUser && (
              <p className="text-xs text-muted-foreground mt-1">
                Assegnato a{" "}
                <span className="font-medium text-foreground">
                  {opportunity.assignedUser.details?.firstName}{" "}
                  {opportunity.assignedUser.details?.lastName}
                </span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}