import { LeadSourceBadge } from "@/components/lead/lead-source-badge";
import { LeadStatusBadge } from "@/components/lead/lead-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { Globe, MapPin } from "lucide-react";

interface Props {
  lead: Lead;
}

export function LeadDetailOverview({ lead }: Props) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Azienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DataRow label="Ragione sociale" value={lead.companyName} />
            {lead.tradeName && <DataRow label="Nome commerciale" value={lead.tradeName} />}
            {lead.vatNumber && <DataRow label="P.IVA" value={lead.vatNumber} />}
            {lead.taxCode && <DataRow label="Codice fiscale" value={lead.taxCode} />}
            {lead.website && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Website</span>
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {lead.website}
                </a>
              </div>
            )}
            <Separator />
            <DataRow label="Fonte" value={<LeadSourceBadge source={lead.source} />} />
            <DataRow label="Status" value={<LeadStatusBadge status={lead.status} />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indirizzo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lead.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>
                  {lead.address}
                  {lead.city && `, ${lead.city}`}
                  {lead.provinceCode && ` (${lead.provinceCode})`}
                  {lead.zipCode && ` — ${lead.zipCode}`}
                </span>
              </div>
            )}
            <DataRow label="Paese" value={lead.countryCode} />
            <Separator />
            <DataRow label="Creato il" value={formatDateIT(lead.createdAt)} />
            <DataRow label="Aggiornato" value={formatDateIT(lead.updatedAt)} />
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
