import { LeadScoreDisplay } from "@/components/lead/lead-score-display";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateIT } from "@/helpers/date-helper";
import { Lead } from "@mini-erp/shared";
import { getTranslations } from "next-intl/server";

interface LeadDetailPageProps {
  lead: Lead;
}

/**
 * Lead score hero card
 * @param param0
 * @returns
 */
export default async function LeadDetailHero({ lead }: LeadDetailPageProps) {
  const t = await getTranslations("crm");
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{`${t("leads.leadScore")} `}</p>
          <LeadScoreDisplay score={lead.score} size="lg" showBar />
          <p className="text-xs text-muted-foreground mt-1">{`${t("leads.outOf100")} `}</p>
        </div>
        <div className="text-right space-y-1 text-sm text-muted-foreground">
          {lead.assignedUser && (
            <p>
              {`${t("assignedUser")} `}
              <span className="font-medium text-foreground">
                {lead.assignedUser.details?.firstName} {lead.assignedUser.details?.lastName}
              </span>
            </p>
          )}
          {lead.lastContactDate && (
            <p>
              {`${t("leads.lastContact")} `}
              <span className="font-medium text-foreground">
                {formatDateIT(lead.lastContactDate)}
              </span>
            </p>
          )}
          {lead.activities && (
            <p>
              {`${t("leads.nextFollowUp")} `}
              <span className="font-medium text-foreground">
                {formatDateIT(lead.activities[0]?.scheduledStart)}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
