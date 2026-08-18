import RoleListPage from "@/app/(protected)/admin/roles/components/role-list";
import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllRoles } from "@/services/server/role-service";
import { RoleQueryInput, roleQuerySchema } from "@mini-erp/shared";
import { getTranslations } from "next-intl/server";

interface RolesPageProps {
  searchParams: Promise<RoleQueryInput>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  await requirePermission("role:read");

  const params: RoleQueryInput = roleQuerySchema.parse(await searchParams);

  const [result, permissions] = await Promise.all([
    getAllRoles(params),
    checkEntityPermissions("role"),
  ]);

  const t = await getTranslations("admin.roles");

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("roles"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <RoleListPage data={result} />
    </>
  );
}
