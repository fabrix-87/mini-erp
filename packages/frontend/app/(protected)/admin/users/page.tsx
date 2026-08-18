// app/settings/users/page.tsx
import { checkUserPermission, requirePermission } from "@/lib/server/auth";
import { getAllUsers, getUserStats } from "@/services/server/user-service";
import UsersContent from "@/app/(protected)/admin/users/components/users-content";
import { UserQueryInput, userQuerySchema } from "@mini-erp/shared";
import { getTranslations } from "next-intl/server";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { PageHeader } from "@/components/page-header";

interface PageProps {
  searchParams: Promise<UserQueryInput>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  // Authorization
  await requirePermission("user:read");

  const queryParams: UserQueryInput = userQuerySchema.parse(await searchParams);

  const [users, stats, canCreate] = await Promise.all([
    getAllUsers({ ...queryParams, revalidate: 600 }),
    getUserStats(),
    checkUserPermission("user:create"),
  ]);

  const t = await getTranslations("admin.users");

  const actionItems = [
    createCreateAction("create", t("createNewButton") ?? "Nuovo", getNewRoute("users"), canCreate),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <UsersContent
        queryParams={queryParams}
        usersList={users}
        stats={stats}
        canCreate={canCreate}
      />
    </>
  );
}
