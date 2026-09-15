// app/(protected)/crm/opportunities/[id]/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOpportunityById } from "@/services/server/opportunity-service";
import { formatDateIT } from "@/helpers/date-helper";
import { type PageHeaderAction, type PageIdProps } from "@/types/page-types";
import { OpportunityDetailHero } from "../components/opportunity-detail-hero";
import { OpportunityDetailOverview } from "../components/opportunity-detail-overview";
import { OpportunityDetailCommercial } from "../components/opportunity-detail-commercial";
import { OpportunityDetailActivities } from "../components/opportunity-detail-activities";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getTranslations } from "next-intl/server";
import { createDeleteServerAction, createEditAction } from "@/helpers/page-header-actions-helper";
import { getEditRoute } from "@/lib/navigation-routes";
import {
  closeOppotunityLostAction,
  closeOppotunityWonAction,
  deleteOpportunityAction,
} from "@/actions/opportunity-actions";
import { PageHeader } from "@/components/page-header";

/**
 * Opportunity detail page — Server Component.
 * Fetches opportunity data server-side and delegates interactive actions to client islands.
 */
export default async function OpportunityDetailPage({ params }: PageIdProps) {
  await requirePermission("opportunity:read");
  const { id } = await params;
  const t = await getTranslations("crm");

  const [opportunity, permissions] = await Promise.all([
    getOpportunityById(id),
    checkEntityPermissions("opportunity"),
  ]);

  const isCloseable = opportunity.status === "OPEN" || opportunity.status === "PENDING";

  const closeWonAction = closeOppotunityWonAction.bind(null, id);
  const closeLostAction = closeOppotunityLostAction.bind(null, id);
  const deleteAction = deleteOpportunityAction.bind(null, id);

  const actionItems: PageHeaderAction[] = [
    {
      key: "win",
      label: t("opportunities.stats.won"),
      action: closeWonAction,
      visible: isCloseable,
      icon: "trophy",
      className: "text-lime-200 bg-lime-500 hover:bg-lime-600",
    },
    {
      key: "lost",
      label: t("opportunities.stats.lost"),
      action: closeLostAction,
      visible: isCloseable,
      icon: "x-circle",
      className: "text-destructive bg-destructive/20 hover:bg-destructive/5",
    },
    createEditAction(
      "update",
      t("editButton") ?? "Modifica",
      getEditRoute("opportunities", id),
      permissions.canUpdate,
    ),
    createDeleteServerAction(
      "delete",
      t("deleteButton") ?? "Elimina",
      deleteAction,
      {
        title: t("deleteDialogTitle", {
          name: opportunity.title,
        }),
        description: t("deleteDialogDescription"),
        confirmLabel: t("deleteDialogConfirm"),
        cancelLabel: t("deleteDialogCancel"),
      },
      permissions.canDelete,
    ),
  ];

  return (
    <>
      <PageHeader
        actionItems={actionItems}
        extraBreadcrumbs={[{ label: opportunity.title }]}
        title={opportunity.title}
        subtitle={t('opportunities.detail.description', {
          date: formatDateIT(opportunity.createdAt),
          user: `${opportunity.createdBy.details?.firstName} ${opportunity.createdBy.details?.lastName}`
        })}
      />

      <div className="space-y-6">       
        {/* Hero KPI card */}
        <OpportunityDetailHero opportunity={opportunity} />

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="commercial">
              {t("tabs.commercial")}
              {(opportunity.proposedProducts?.length ?? 0) > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">
                  {opportunity.proposedProducts!.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities">
              {t("tabs.activities")} ({opportunity.activities?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <OpportunityDetailOverview opportunity={opportunity} />
          </TabsContent>

          <TabsContent value="commercial" className="mt-4">
            <OpportunityDetailCommercial opportunity={opportunity} />
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <OpportunityDetailActivities
              opportunityId={opportunity.id}
              activities={opportunity.activities}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.opportunities");
  try {
    const { id } = await params;

    const opportunity = await getOpportunityById(id, 3600);

    return {
      title: `${opportunity.title} - ${t("opportunityDetailTitle")} | ${process.env.APP_NAME}`,
    };
  } catch {
    return {
      title: `${t("opportunityDetailTitle")} | ${process.env.APP_NAME}`,
    };
  }
}