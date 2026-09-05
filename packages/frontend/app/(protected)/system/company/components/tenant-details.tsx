// app/(protected)/settings/tenant/components/tenant-details.tsx
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TenantWithDetails } from "@mini-erp/shared";

import { getTranslations } from "next-intl/server";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { Building, ChartBar, FileText, Settings, Users } from "lucide-react";

interface TenantDetailsProps {
  tenant: TenantWithDetails;
}

/**
 * Read-only display of the current tenant's configuration and stats.
 * Renders company data, fiscal settings, plan info, and entity counts.
 *
 * @param tenant - The fully loaded {@link TenantWithDetails} for the current tenant.
 */
export async function TenantDetails({ tenant }: TenantDetailsProps) {
  const t = await getTranslations("system.tenant");
  const { company, _count } = tenant;

  return (
    <div className="space-y-4">
      <BreadcrumbSetter title={company.companyName} />
      {/* Azienda */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("sections.company")}</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField label={t("fields.companyName")} value={company.companyName} />
          <DetailField label={t("fields.vatNumber")} value={company.vatNumber ?? "—"} />
          <DetailField label={t("fields.taxCode")} value={company.taxCode ?? "—"} />
          <DetailField label={t("fields.sdiCode")} value={company.sdiCode ?? "—"} />
          <DetailField label={t("fields.pec")} value={company.pec ?? "—"} />
          <DetailField label={t("fields.email")} value={company.mainEmail ?? "—"} />
          <DetailField label={t("fields.phone")} value={company.mainPhone ?? "—"} />
          <DetailField label={t("fields.website")} value={company.mainWebsite ?? "—"} />
        </div>
        {company.legalAddress && (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 pt-1">
            <DetailField
              label={t("fields.address")}
              value={company.legalAddress.address ?? "—"}
              className="sm:col-span-6"
            />
            <DetailField
              label={t("fields.city")}
              value={company.legalAddress.city ?? "—"}
              className="sm:col-span-3"
            />
            <DetailField
              label={t("fields.zipCode")}
              value={company.legalAddress.zipCode ?? "—"}
              className="sm:col-span-1"
            />
            <DetailField
              label={t("fields.province")}
              value={company.legalAddress.provinceCode ?? "—"}
              className="sm:col-span-2"
            />
            <DetailField
              label={t("fields.country")}
              value={company.legalAddress.countryCode ?? "—"}
              className="sm:col-span-2"
            />
          </div>
        )}
      </div>

      {/* Configurazione fiscale */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("sections.fiscal")}</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField label={t("fields.taxRegime")} value={tenant.taxRegime} />
          <DetailField label={t("fields.defaultCurrency")} value={tenant.defaultCurrency} />
          <DetailField label={t("fields.sdiFormat")} value={tenant.sdiTransmissionFormat ?? "—"} />
          <DetailField label={t("fields.tenantCode")} value={tenant.code} mono />
        </div>
      </div>

      {/* Piano e stato */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("sections.plan")}</h2>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("fields.plan")}</p>
            <Badge variant="outline" className="text-xs font-medium">
              {tenant.plan}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("fields.status")}</p>
            <Badge
              variant={tenant.status === "ACTIVE" ? "default" : "secondary"}
              className="text-xs font-medium"
            >
              {tenant.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("fields.createdAt")}</p>
            <p className="text-sm font-medium">
              {new Date(tenant.createdAt).toLocaleDateString("it-IT")}
            </p>
          </div>
        </div>
      </div>

      {/* Riepilogo dati */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ChartBar size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("sections.stats")}</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard
            label={t("stats.memberships")}
            value={_count.memberships}
            icon={<Users size={14} />}
          />
          <StatCard label={t("stats.customers")} value={_count.customers} />
          <StatCard label={t("stats.suppliers")} value={_count.suppliers} />
          <StatCard label={t("stats.products")} value={_count.products} />
          <StatCard label={t("stats.leads")} value={_count.leads} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Internal sub-components
// ============================================================================

interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

/**
 * A single read-only label/value pair, styled consistently with the form fields.
 */
function DetailField({ label, value, mono = false, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

/**
 * A compact numeric stat tile for the entity count summary.
 */
function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2.5 space-y-0.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-lg font-semibold tabular-nums">{value.toLocaleString("it-IT")}</p>
    </div>
  );
}
