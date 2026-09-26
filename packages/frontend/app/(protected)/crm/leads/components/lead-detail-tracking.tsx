import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/data-row";
import { Separator } from "@/components/ui/separator";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailTraking({ lead }: Props) {
  const t = await getTranslations("crm.leads");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            {t("tracking")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lead.campaignName && (
            <DataRow
              label={t("form.campaignName")}
              value={lead.campaignName}
              tooltip={t("form.campaignNameDescription")}
            />
          )}
          {lead.utmSource && (
            <DataRow
              label={t("form.utmSource")}
              value={lead.utmSource}
              tooltip={t("form.utmSourceDescription")}
            />
          )}
          {lead.utmMedium && (
            <DataRow
              label={t("form.utmMedium")}
              value={lead.utmMedium}
              tooltip={t("form.utmMediumDescription")}
            />
          )}
          {lead.utmCampaign && (
            <DataRow
              label={t("form.utmCampaign")}
              value={lead.utmCampaign}
              tooltip={t("form.utmCampaignDescription")}
            />
          )}
          {lead.landingPage && (
            <DataRow
              label={t("form.landingPage")}
              value={lead.landingPage}
              tooltip={t("form.landingPageDescription")}
            />
          )}
          {lead.referrer && (
            <DataRow
              label={t("form.referrer")}
              value={lead.referrer}
              tooltip={t("form.referrerDescription")}
            />
          )}
          <Separator />
          <DataRow label={t("contactAttempts")} value={String(lead.contactAttempts)} />
          {lead.firstContactDate && (
            <DataRow label={t("firstContactDate")} value={formatDateIT(lead.firstContactDate)} />
          )}
          {lead.lastContactDate && (
            <DataRow label={t("lastContactDate")} value={formatDateIT(lead.lastContactDate)} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
