// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, User } from "lucide-react";
import type { OpportunityComplete } from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";
import { useTranslations } from "next-intl";

interface Props {
  opportunity: OpportunityComplete;
}

/**
 * Overview tab: source entity (lead or customer), base info, notes.
 */
export function OpportunityDetailOverview({ opportunity }: Props) {
  const t = useTranslations("crm.opportunities");
  const entityLabel = opportunity.lead ? t("detail.leadRelated") : t("detail.customer");

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
              <Row
                label="Contatto"
                value={`${opportunity.lead.contactFirstName} ${opportunity.lead.contactLastName}`}
              />
              {opportunity.lead.contactEmail && (
                <Row
                  label="Email"
                  value={
                    <a
                      href={`mailto:${opportunity.lead.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {opportunity.lead.contactEmail}
                    </a>
                  }
                />
              )}
            </>
          ) : (
            <>
              <Row
                label={t("detail.customer")}
                value={opportunity.customer.company.companyName ?? opportunity.customer.id}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dati opportunità */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("detail.opportunityData")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label={t("form.source")} value={t(`source.${opportunity.source.toLowerCase()}`)} />
          <Row label={t("form.stage")} value={t(`stage.${opportunity.stage.toLowerCase()}`)} />
          <Separator />
          <Row label={t("detail.createdAt")} value={formatDateIT(opportunity.createdAt)} />
          <Row label={t("detail.updatedAt")} value={formatDateIT(opportunity.updatedAt)} />
          {opportunity.lastStageChange && (
            <Row
              label={t("detail.lastStageChange")}
              value={formatDateIT(opportunity.lastStageChange)}
            />
          )}
        </CardContent>
      </Card>

      {/* Note */}
      {opportunity.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("detail.notes")}</CardTitle>
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
