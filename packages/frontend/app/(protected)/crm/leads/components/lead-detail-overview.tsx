import { LeadSourceBadge } from "@/components/lead/lead-source-badge";
import { LeadStatusBadge } from "@/components/lead/lead-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/data-row";
import { Separator } from "@/components/ui/separator";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { Globe, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailOverview({ lead }: Props) {
  const t = await getTranslations('crm.leads')
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('company')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DataRow label={t('form.companyName')} value={lead.companyName} />
            {lead.tradeName && <DataRow label={t('form.tradeName')} value={lead.tradeName} />}
            {lead.vatNumber && <DataRow label={t('form.vatNumber')} value={lead.vatNumber} />}
            {lead.taxCode && <DataRow label={t('form.taxCode')} value={lead.taxCode} />}
            {lead.website && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('form.website')}</span>
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
            <DataRow label={t('form.source')} value={<LeadSourceBadge source={lead.source} label={t(`source.${lead.source}`)}/>} />
            <DataRow label={t('form.status')} value={<LeadStatusBadge status={lead.status} label={t(`status.${lead.status}`)}/>} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('form.address')}</CardTitle>
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
            <DataRow label={t('form.country')} value={`${lead.country.name} [ ${lead.countryCode} ]`} />
            <Separator />
            <DataRow label={t('form.createdAt')} value={formatDateIT(lead.createdAt)} />
            <DataRow label={t('form.updatedAt')} value={formatDateIT(lead.updatedAt)} />
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('form.note')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
