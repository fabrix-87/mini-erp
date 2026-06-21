// app/leads/page.tsx
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { LeadsClient } from "./components/leads-client";

// ============================================================================
// Page — Server Component
// ============================================================================

/**
 * Lead list page — Server Component wrapper.
 * Renders static shell + delegates dynamic data to LeadsClient.
 */
export default function LeadsPage() {
  return (
    <>
      <BreadcrumbSetter items={[{ label: "Lead" }]} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
            <p className="text-muted-foreground">Gestisci e qualifica i tuoi lead commerciali</p>
          </div>
          <Button asChild>
            <Link href="/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Lead
            </Link>
          </Button>
        </div>

        {/* Dynamic content */}
        <LeadsClient />
      </div>
    </>
  );
}
