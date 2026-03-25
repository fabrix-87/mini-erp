// app/settings/users/page.tsx
import { redirect } from "next/navigation";
import { checkUserPermission, requirePermission } from "@/lib/server/auth";
import { getAllUsers, getUserStats } from "@/services/server/user";
import { ServerApiError } from "@/types/server-client";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import UsersContent from "@/components/users/users-content";
import { userKeys } from "@/types/user";
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

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: userKeys.list(queryParams),
      queryFn: () => getAllUsers({ ...queryParams, revalidate: 30 }),
    }),
    queryClient.prefetchQuery({
      queryKey: userKeys.stats(),
      queryFn: () => getUserStats(),
    }),
  ]);

  const canCreate = await checkUserPermission("user:create");

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestione Utenti</h1>
            <p className="text-muted-foreground mt-2">Amministra gli utenti del sistema.</p>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/settings/users/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo utente
              </Link>
            </Button>
          )}
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <BreadcrumbSetter title="Gestione Utenti" />
          <UsersContent queryParams={queryParams} />
        </HydrationBoundary>
      </div>
    </div>
  );
}

export const metadata = {
  title: `Gestione Utenti | ${process.env.APP_NAME}`,
  description: "Amministra gli utenti del sistema",
};
