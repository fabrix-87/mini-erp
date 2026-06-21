// app/leads/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { LeadForm } from "@/components/lead/lead-form";
import { getLeadByIdServer } from "@/services/server/lead";

// ============================================================================
// Page — Server Component
// ============================================================================

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Lead edit page — Server Component.
 * Fetches current lead data server-side and passes it to LeadForm in edit mode.
 */
export default async function EditLeadPage({ params }: Props) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  const response = await getLeadByIdServer(numId).catch(() => null);
  if (!response?.data) notFound();

  const lead = response.data;

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Lead", href: "/leads" },
          { label: lead.companyName, href: `/leads/${lead.id}` },
          { label: "Modifica" },
        ]}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica — {lead.companyName}</h1>
          <p className="text-muted-foreground">{lead.code} · Aggiorna i dati del lead</p>
        </div>

        <LeadForm mode="edit" lead={lead} />
      </div>
    </>
  );
}
