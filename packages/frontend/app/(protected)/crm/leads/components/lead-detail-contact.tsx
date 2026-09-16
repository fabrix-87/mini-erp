import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@mini-erp/shared";
import { Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailContact({ lead }: Props) {
  const t = await getTranslations('crm.leads')
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('contact')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DataRow label={t('form.contactName')} value={`${lead.contactFirstName} ${lead.contactLastName}`} />
          {lead.contactPosition && <DataRow label={t('form.contactPosition')} value={lead.contactPosition} />}
          {lead.contactDepartment && (
            <DataRow label={t('form.contactDepartment')} value={lead.contactDepartment} />
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('form.contactEmail')}</span>
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
              <span className="text-muted-foreground">{t('form.contactPhone')}</span>
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
              <span className="text-muted-foreground">{t('form.contactMobile')}</span>
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
