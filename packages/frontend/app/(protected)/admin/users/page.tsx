// app/settings/users/page.tsx
import { redirect } from "next/navigation";
import { checkUserPermission, requirePermission } from "@/lib/server/auth";
import { getAllUsers, getUserStats } from "@/services/server/user-service";
import { ServerApiError } from "@/types/server-client";
import UsersContent from "@/app/(protected)/admin/users/components/users-content";
import { UserQueryInput, userQuerySchema } from "@mini-erp/shared";

interface PageProps {
  searchParams: Promise<UserQueryInput>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  // Authorization
  try {
    await requirePermission("user:read");
  } catch (error) {
    if (error instanceof ServerApiError) {
      if (error.statusCode === 401) redirect("/login");
      if (error.statusCode === 403) redirect("/dashboard");
    }
    throw error;
  }

  const queryParams: UserQueryInput = userQuerySchema.parse(await searchParams);

  const [users, stats, canCreate] = await Promise.all([
    getAllUsers({ ...queryParams, revalidate: 600 }),
    getUserStats(),
    checkUserPermission("user:create"),
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <UsersContent
          queryParams={queryParams}
          usersList={users}
          stats={stats}
          canCreate={canCreate}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: `Gestione Utenti | ${process.env.APP_NAME}`,
  description: "Amministra gli utenti del sistema",
};
