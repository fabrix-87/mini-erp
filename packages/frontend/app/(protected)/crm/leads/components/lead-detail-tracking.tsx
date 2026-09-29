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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-muted-foreground" />
            {t("tracking")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Acquisition */}
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("acquisition")}
              </div>

              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <div className="space-y-2">
                  {lead.campaignName && (
                    <DataRow
                      label={t("form.campaign.label")}
                      value={lead.campaignName}
                      tooltip={t("form.campaign.description")}
                    />
                  )}

                  {lead.utmSource && (
                    <DataRow
                      label={t("form.utmSource.label")}
                      value={lead.utmSource}
                      tooltip={t("form.utmSource.description")}
                    />
                  )}

                  {lead.utmMedium && (
                    <DataRow
                      label={t("form.utmMedium.label")}
                      value={lead.utmMedium}
                      tooltip={t("form.utmMedium.description")}
                    />
                  )}

                  {lead.utmCampaign && (
                    <DataRow
                      label={t("form.utmCampaign.label")}
                      value={lead.utmCampaign}
                      tooltip={t("form.utmCampaign.description")}
                    />
                  )}

                  {lead.landingPage && (
                    <DataRow
                      label={t("form.landingPage.label")}
                      value={lead.landingPage}
                      tooltip={t("form.landingPage.description")}
                    />
                  )}

                  {lead.referrer && (
                    <DataRow
                      label={t("form.referrer.label")}
                      value={lead.referrer}
                      tooltip={t("form.referrer.description")}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Contact activity */}
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("contactActivity")}
              </div>

              <div className="overflow-hidden rounded-md">
                <div className="rounded-md border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground">{t("contactAttempts")}</div>
                  <div className="mt-1 text-lg font-semibold">{lead.contactAttempts}</div>
                </div>

                {lead.firstContactDate && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="text-xs text-muted-foreground">{t("firstContactDate")}</div>
                    <div className="mt-1 text-sm font-medium">
                      {formatDateIT(lead.firstContactDate)}
                    </div>
                  </div>
                )}

                {lead.lastContactDate && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="text-xs text-muted-foreground">{t("lastContactDate")}</div>
                    <div className="mt-1 text-sm font-medium">
                      {formatDateIT(lead.lastContactDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
