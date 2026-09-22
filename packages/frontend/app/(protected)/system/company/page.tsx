import { getCurrentTenant } from "@/services/server/tenant-service";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TenantDetails } from "./components/tenant-details";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";

export default async function TenantCompany() {
  await requirePermission("tenant:read");

  const tenant = await getCurrentTenant(false);
  const t = await getTranslations("system.tenant");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} />
      <TenantDetails tenant={tenant} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("system");

  return {
    title: `${t("tenant.title")} | ${process.env.APP_NAME}`,
    description: t("tenant.description"),
  };
}
