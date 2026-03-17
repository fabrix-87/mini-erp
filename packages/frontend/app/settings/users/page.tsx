// app/settings/users/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { checkUserPermission, requirePermission } from "@/lib/server/auth";
import { getAllUsers, getUserStats } from "@/services/server/user";
import { ServerApiError } from "@/types/server-client";
import { UsersFilterBar } from "@/components/users/users-filter-bar";
import { UsersTable } from "@/components/users/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, Shield, Plus } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { StatisticCard } from "@/components/ui/statistic-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// ============================================================================
// Server Component - Admin Users List
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    active?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

// Component separato per il contenuto che dipende dai dati
async function UsersContent({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse Query Params
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "20", 10);
  const search = params.search || undefined;
  const active = params.active === "true" ? true : params.active === "false" ? false : undefined;
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  // Fetch Data (Parallel)
  const [usersResponse, stats] = await Promise.all([
    getAllUsers({
      page,
      limit,
      search,
      active,
      sortBy,
      sortOrder,
      revalidate: 30,
    }),
    getUserStats(),
  ]);

  const { data: users, pagination } = usersResponse;

  return (
    <>
      <BreadcrumbSetter title="Gestione Utenti" />
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatisticCard
          title="Utenti Totali"
          value={stats.total}
          icon={Users}
          colorClass="text-muted-foreground"
        />
        <StatisticCard
          title="Attivi"
          value={stats.active}
          icon={UserCheck}
          colorClass="text-green-600"
          description={`${((stats.active / stats.total) * 100).toFixed(1)}% del totale`}
        />
        <StatisticCard
          title="Inattivi"
          value={stats.inactive}
          icon={UserX}
          colorClass="text-red-600"
          description={`${((stats.inactive / stats.total) * 100).toFixed(1)}% del totale`}
        />
        <StatisticCard
          title="Ruoli"
          value={Object.keys(stats.byRole).length}
          icon={Shield}
          colorClass="text-blue-600"
          description="Tipi di ruolo configurati"
        />
      </div>

      {/* Filters */}
      <UsersFilterBar
        initialSearch={search}
        initialActive={active}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder}
      />

      {/* Users Table */}
      <UsersTable users={users} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel="utenti"
        />
      )}
    </>
  );
}

// Loading skeleton
function UsersLoadingSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="rounded-lg border bg-card">
        <Skeleton className="h-100 w-full" />
      </div>
    </>
  );
}

// Main Page Component
export default async function UsersPage({ searchParams }: PageProps) {
  // ========================================
  // Authorization Check
  // ========================================
  try {
    await requirePermission("user:read");
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 401) {
      redirect("/login");
    }
    if (error instanceof ServerApiError && error.statusCode === 403) {
      redirect("/dashboard");
    }
    throw error;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestione Utenti</h1>
            <p className="text-muted-foreground mt-2">Amministra gli utenti del sistema.</p>
          </div>
          {(await checkUserPermission("user:create")) && (
            <Button asChild>
              <Link href="/settings/users/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo utente
              </Link>
            </Button>
          )}
        </div>

        {/* Content with Suspense */}
        <Suspense fallback={<UsersLoadingSkeleton />}>
          <UsersContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// Metadata
export const metadata = {
  title: `Gestione Utenti | ${process.env.APP_NAME}`,
  description: "Amministra gli utenti del sistema",
};
