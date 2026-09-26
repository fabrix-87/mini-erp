import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow } from "@/components/data-row";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@mini-erp/shared";
import { Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  lead: Lead;
}

export async function LeadDetailCommercial({ lead }: Props) {
  const t = await getTranslations("crm.leads");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {t("commercial")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lead.estimatedValue && (
            <DataRow
              label={t("form.estimatedValue")}
              value={`€ ${Number(lead.estimatedValue).toLocaleString("it-IT")}`}
            />
          )}
          {lead.budget && (
            <DataRow
              label={t("form.budget")}
              value={`€ ${Number(lead.budget).toLocaleString("it-IT")}`}
            />
          )}
          {lead.annualRevenue && (
            <DataRow
              label={t("form.annualRevenue")}
              value={`€ ${Number(lead.annualRevenue).toLocaleString("it-IT")}`}
            />
          )}
          {lead.estimatedSize && (
            <DataRow label={t("form.estimatedSize")} value={lead.estimatedSize} />
          )}
          {lead.industry && <DataRow label={t("form.industry")} value={lead.industry} />}
          {lead.employeesCount && (
            <DataRow label={t("form.employeesCount")} value={String(lead.employeesCount)} />
          )}
          {lead.purchaseTimeframe && (
            <DataRow label={t("form.purchaseTimeframe")} value={lead.purchaseTimeframe} />
          )}
          {lead.decisionAuthority && (
            <DataRow label={t("form.decisionAuthority")} value={lead.decisionAuthority} />
          )}
          {lead.primaryNeed && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground">{t("form.primaryNeed")}</p>
                <p className="whitespace-pre-wrap">{lead.primaryNeed}</p>
              </div>
            </>
          )}
          {lead.interestedIn && (
            <div className="space-y-1">
              <p className="text-muted-foreground">{t("form.interestedIn")}</p>
              <p className="whitespace-pre-wrap">{lead.interestedIn}</p>
            </div>
          )}
          {lead.competitors && (
            <div className="space-y-1">
              <p className="text-muted-foreground">{t("form.competitors")}</p>
              <p className="whitespace-pre-wrap">{lead.competitors}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
