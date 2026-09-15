import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@mini-erp/shared";
import { Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export function LeadDetailCommercial({ lead }: Props) {
  const t = getTranslations("crm");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Dati Commerciali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lead.estimatedValue && (
            <DataRow
              label="Valore stimato"
              value={`€ ${Number(lead.estimatedValue).toLocaleString("it-IT")}`}
            />
          )}
          {lead.budget && (
            <DataRow label="Budget" value={`€ ${Number(lead.budget).toLocaleString("it-IT")}`} />
          )}
          {lead.annualRevenue && (
            <DataRow
              label="Fatturato annuo"
              value={`€ ${Number(lead.annualRevenue).toLocaleString("it-IT")}`}
            />
          )}
          {lead.estimatedSize && <DataRow label="Dimensione stimata" value={lead.estimatedSize} />}
          {lead.industry && <DataRow label="Settore" value={lead.industry} />}
          {lead.employeesCount && (
            <DataRow label="Dipendenti" value={String(lead.employeesCount)} />
          )}
          {lead.purchaseTimeframe && (
            <DataRow label="Timeframe acquisto" value={lead.purchaseTimeframe} />
          )}
          {lead.decisionAuthority && (
            <DataRow label="Autorità decisione" value={lead.decisionAuthority} />
          )}
          {lead.primaryNeed && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground">Necessità principale</p>
                <p className="whitespace-pre-wrap">{lead.primaryNeed}</p>
              </div>
            </>
          )}
          {lead.interestedIn && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Interessato a</p>
              <p className="whitespace-pre-wrap">{lead.interestedIn}</p>
            </div>
          )}
          {lead.competitors && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Concorrenti</p>
              <p className="whitespace-pre-wrap">{lead.competitors}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
