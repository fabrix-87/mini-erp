// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, User } from "lucide-react";
import type { OpportunityComplete } from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";

interface Props { opportunity: OpportunityComplete; }

/**
 * Overview tab: source entity (lead or customer), base info, notes.
 */
export function OpportunityDetailOverview({ opportunity }: Props) {
  const entity = opportunity.lead ?? opportunity.customer;
  const entityLabel = opportunity.lead ? "Lead collegato" : "Cliente";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Source entity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {opportunity.lead ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            {entityLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {opportunity.lead ? (
            <>
              <Row label="Ragione sociale" value={opportunity.lead.companyName} />
              <Row label="Contatto" value={`${opportunity.lead.contactFirstName} ${opportunity.lead.contactLastName}`} />
              {opportunity.lead.contactEmail && (
                <Row
                  label="Email"
                  value={
                    <a href={`mailto:${opportunity.lead.contactEmail}`} className="text-primary hover:underline">
                      {opportunity.lead.contactEmail}
                    </a>
                  }
                />
              )}
            </>
          ) : (
            <>
              <Row label="Cliente" value={opportunity.customer.company.companyName ?? opportunity.customer.id} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dati opportunità */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dati opportunità</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Fonte" value={opportunity.source} />
          <Row label="Stage" value={opportunity.stage} />
          <Separator />
          <Row label="Creata il" value={formatDateIT(opportunity.createdAt)} />
          <Row label="Aggiornata" value={formatDateIT(opportunity.updatedAt)} />
          {opportunity.lastStageChange && (
            <Row label="Ultimo cambio stage" value={formatDateIT(opportunity.lastStageChange)} />
          )}
        </CardContent>
      </Card>

      {/* Note */}
      {opportunity.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{opportunity.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}