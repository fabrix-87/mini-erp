import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export function LeadDetailTraking({ lead }: Props) {
  const t = getTranslations("crm");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campaign Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lead.campaignName && <DataRow label="Campagna" value={lead.campaignName} />}
          {lead.utmSource && <DataRow label="UTM Source" value={lead.utmSource} />}
          {lead.utmMedium && <DataRow label="UTM Medium" value={lead.utmMedium} />}
          {lead.utmCampaign && <DataRow label="UTM Campaign" value={lead.utmCampaign} />}
          {lead.landingPage && <DataRow label="Landing page" value={lead.landingPage} />}
          {lead.referrer && <DataRow label="Referrer" value={lead.referrer} />}
          <Separator />
          <DataRow label="Tentativi contatto" value={String(lead.contactAttempts)} />
          {lead.firstContactDate && (
            <DataRow label="Primo contatto" value={formatDateIT(lead.firstContactDate)} />
          )}
          {lead.lastContactDate && (
            <DataRow label="Ultimo contatto" value={formatDateIT(lead.lastContactDate)} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
