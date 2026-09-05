// app/(protected)/crm/opportunities/[id]/page.tsx
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { getOpportunityById } from "@/services/server/opportunity-service";
import { formatDateIT } from "@/helpers/date-helper";
import type { PageIdProps } from "@/types/page-types";
import { OpportunityDetailActions } from "../components/opportunity-detail-actions";
import { OpportunityDetailHero } from "../components/opportunity-detail-hero";
import { OpportunityDetailOverview } from "../components/opportunity-detail-overview";
import { OpportunityDetailCommercial } from "../components/opportunity-detail-commercial";
import { OpportunityDetailActivities } from "../components/opportunity-detail-activities";

/**
 * Opportunity detail page — Server Component.
 * Fetches opportunity data server-side and delegates interactive actions to client islands.
 */
export default async function OpportunityDetailPage({ params }: PageIdProps) {
  const { id } = await params;

  const opportunity = await getOpportunityById(id);
  if (!opportunity) notFound();

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Opportunità", href: "/crm/opportunities" },
          { label: opportunity.title },
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/crm/opportunities">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{opportunity.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Creata il {formatDateIT(opportunity.createdAt)}
                {opportunity.createdBy && (
                  <> · da {opportunity.createdBy.details?.firstName} {opportunity.createdBy.details?.lastName}</>
                )}
              </p>
            </div>
          </div>

          {/* Client island: Edit / Win / Lose / Delete */}
          <OpportunityDetailActions opportunity={opportunity} />
        </div>

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