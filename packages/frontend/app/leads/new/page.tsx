// app/leads/new/page.tsx
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { LeadForm } from "@/components/leads/lead-form";

/**
 * New lead creation page — Server Component wrapper.
 */
export default function NewLeadPage() {
  return (
    <>
      <BreadcrumbSetter items={[{ label: "Lead", href: "/leads" }, { label: "Nuovo lead" }]} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuovo Lead</h1>
          <p className="text-muted-foreground">Inserisci i dati del nuovo lead commerciale</p>
        </div>

        <LeadForm mode="create" />
      </div>
    </>
  );
}
