import { getCurrentTenant } from "@/services/server/tenant-service";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TenantDetails } from "./components/tenant-details";

export default async function TenantCompany() {
  const tenant = await getCurrentTenant(false);

  return (
    <>
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
