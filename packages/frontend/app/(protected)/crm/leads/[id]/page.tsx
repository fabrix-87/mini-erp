// app/leads/[id]/page.tsx
import { notFound } from "next/navigation";
import { LeadStatusBadge } from "@/components/lead/lead-status-badge";
import { LeadQualityBadge } from "@/components/lead/lead-quality-badge";
import { daysSince, formatDateIT } from "@/helpers/date-helper";
import { PageHeaderAction, PageIdProps } from "@/types/page-types";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { createDeleteServerAction, createEditAction } from "@/helpers/page-header-actions-helper";
import { getTranslations } from "next-intl/server";
import { getEditRoute } from "@/lib/navigation-routes";
import { deleteLeadAction, getLeadByIdAction } from "@/actions/lead-actions";
import { PageHeader } from "@/components/page-header";
import LeadDetailHero from "../components/lead-detail-hero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadDetailOverview } from "../components/lead-detail-overview";
import { LeadDetailContact } from "../components/lead-detail-contact";
import { LeadDetailCommercial } from "../components/lead-detail-commercial";
import { LeadDetailBant } from "../components/lead-detail-bant";
import { LeadDetailGDPR } from "../components/lead-detail-gdpr";
import { LeadDetailTraking } from "../components/lead-detail-tracking";
import { ActivityList } from "@/components/activity/activity-list";

// ============================================================================
// Page — Server Component
// ============================================================================

/**
 * Lead detail page — Server Component.
 * Fetches lead data server-side; delegates interactive actions to LeadDetailActions.
 */
export default async function LeadDetailPage({ params }: PageIdProps) {
  await requirePermission("lead:read");

  const { id } = await params;

  const [{ data: lead, success }, permissions] = await Promise.all([
    getLeadByIdAction(id, 3600),
    checkEntityPermissions("lead"),
  ]);

  if (!success || !lead) notFound();

  const t = await getTranslations("crm");
  const deleteAction = deleteLeadAction.bind(null, id); // bind per iniettare l'id

  const actionItems: PageHeaderAction[] = [
    createEditAction(
      "update",
      t("editButton") ?? "Modifica",
      getEditRoute("leads", id),
      permissions.canUpdate,
    ),
    createDeleteServerAction(
      "delete",
      t("deleteButton") ?? "Elimina",
      deleteAction,
      {
        title: t("deleteDialogTitle", {
          name: `${lead.companyName}`,
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
        extraBreadcrumbs={[{ label: lead.companyName }]}
        title={lead.companyName}
        badges={[
          <LeadStatusBadge key="status-badge" status={lead.status} label={t(`leads.status.${lead.status}`)} size="md" />,
          <LeadQualityBadge key="quality-badge" quality={lead.quality} label={t(`leads.quality.${lead.quality}`)}/>,
        ]}
        subtitle={t("leads.leadDetailSubtitle", {
          code: lead.code,
          createdAt: formatDateIT(lead.createdAt),
          daysSince: daysSince(lead.createdAt),
        })}
      />

      <div className="space-y-6">
        <LeadDetailHero lead={lead} />

        {/* ------------------------------------------------------------------ */}
        {/* Tabs                                                                */}
        {/* ------------------------------------------------------------------ */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="contact">{t("tabs.contacts")}</TabsTrigger>
            <TabsTrigger value="commercial">{t("tabs.commercial")}</TabsTrigger>
            <TabsTrigger value="bant">{t("tabs.bant")}</TabsTrigger>
            <TabsTrigger value="gdpr">{t("tabs.gdpr")}</TabsTrigger>
            <TabsTrigger value="tracking">{t("tabs.tracking")}</TabsTrigger>
            <TabsTrigger value="activities">
              {t("tabs.activities")} ({lead.activities?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <LeadDetailOverview lead={lead} />
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="mt-4">
            <LeadDetailContact lead={lead} />
          </TabsContent>

          {/* Commercial */}
          <TabsContent value="commercial" className="mt-4">
            <LeadDetailCommercial lead={lead} />
          </TabsContent>

          {/* BANT */}
          <TabsContent value="bant" className="mt-4">
            <LeadDetailBant lead={lead} />
          </TabsContent>

          {/* GDPR */}
          <TabsContent value="gdpr" className="mt-4">
            <LeadDetailGDPR lead={lead} />
          </TabsContent>

          {/* Tracking */}
          <TabsContent value="tracking" className="mt-4">
            <LeadDetailTraking lead={lead} />
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="mt-4">
            <ActivityList leadId={lead.id} activities={lead.activities} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.leads");
  try {
    const { id } = await params;

    const { data: lead } = await getLeadByIdAction(id, 3600);

    return {
      title: `${lead?.companyName} - ${t("leadDetailTitle")} | ${process.env.APP_NAME}`,
    };
  } catch {
    return {
      title: `${t("leadDetailTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
