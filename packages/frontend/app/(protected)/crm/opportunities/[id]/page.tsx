// app/(protected)/crm/opportunities/[id]/page.tsx
import { notFound } from "next/navigation";
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
      className: "text-green-600 border-green-200 hover:bg-green-50",
      variant: 'outline'
    },
    {
      key: "lost",
      label: t("opportunities.stats.lost"),
      action: closeLostAction,
      visible: isCloseable,
      icon: "x-circle",
      className: "text-destructive border-destructive/20 hover:bg-destructive/5",
      variant: 'outline'
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
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="commercial">
              Commerciale
              {(opportunity.proposedProducts?.length ?? 0) > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">
                  {opportunity.proposedProducts!.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities">
              Attività ({opportunity.activities?.length ?? 0})
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
