import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@mini-erp/shared";
import { Mail, Phone } from "lucide-react";

interface Props {
  lead: Lead;
}

export function LeadDetailContact({ lead }: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contatto principale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DataRow label="Nome" value={`${lead.contactFirstName} ${lead.contactLastName}`} />
          {lead.contactPosition && <DataRow label="Posizione" value={lead.contactPosition} />}
          {lead.contactDepartment && (
            <DataRow label="Dipartimento" value={lead.contactDepartment} />
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <a
              href={`mailto:${lead.contactEmail}`}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Mail className="h-3 w-3" />
              {lead.contactEmail}
            </a>
          </div>
          {lead.contactPhone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefono</span>
              <a
                href={`tel:${lead.contactPhone}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Phone className="h-3 w-3" />
                {lead.contactPhone}
              </a>
            </div>
          )}
          {lead.contactMobile && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile</span>
              <a
                href={`tel:${lead.contactMobile}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Phone className="h-3 w-3" />
                {lead.contactMobile}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
