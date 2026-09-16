import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/ui/data-row";
import { Separator } from "@/components/ui/separator";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { ShieldCheck, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailGDPR({ lead }: Props) {
  const t = await getTranslations("crm.leads");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            {t("gdpr")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <GdprConsentRow
            label={t("form.privacy")}
            value={lead.privacyConsent}
            date={lead.privacyConsentDate}
          />
          <GdprConsentRow
            label={t("form.marketing")}
            value={lead.marketingConsent}
            date={lead.marketingConsentDate}
          />
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("form.doNotCall")}</span>
            <Badge variant={lead.doNotCall ? "destructive" : "outline"}>
              {lead.doNotCall ? t("yes") : t("no")}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("form.doNotEmail")}</span>
            <Badge variant={lead.doNotEmail ? "destructive" : "outline"}>
              {lead.doNotEmail ? t("yes") : t("no")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface GdprConsentRowProps {
  label: string;
  value: boolean;
  date?: Date | string | null;
  className?: string;
}

export function GdprConsentRow({ label, value, date, className }: GdprConsentRowProps) {
  const t = useTranslations("crm.gdpr");

  const badgeValue = (
    <div className="flex items-center gap-2">
      <Badge variant={value ? "default" : "secondary"}>{value ? t("granted") : t("denied")}</Badge>

      {value && date && <span className="text-xs text-muted-foreground">{formatDateIT(date)}</span>}
    </div>
  );

  return <DataRow label={label} value={badgeValue} className={className} />;
}
