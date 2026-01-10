// app/settings/users/page.tsx
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/server/auth";
import { getAllUsers, getUserStats } from '@/services/server/user';
import { ServerApiError } from '@/types/server-client';
import { UsersFilterBar } from '@/components/users/users-filter-bar';
import { UsersTable } from '@/components/users/users-table';
import { UsersPagination } from '@/components/users/users-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';


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
    sortOrder?: 'asc' | 'desc';
  }>;
}

// Component separato per il contenuto che dipende dai dati
async function UsersContent({ searchParams }: PageProps) {
  const params = await searchParams

  // Parse Query Params
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '20', 10);
  const search = params.search || undefined;
  const active =
    params.active === 'true'
      ? true
      : params.active === 'false'
      ? false
      : undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

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
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attivi</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.active / stats.total) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inattivi</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.inactive / stats.total) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruoli</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(stats.byRole).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tipi di ruolo configurati
            </p>
          </CardContent>
        </Card>
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
      {pagination.totalPages > 0 && (
        <UsersPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
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
        <Skeleton className="h-[400px] w-full" />
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
    await requirePermission('user:read');
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Utenti</h1>
          <p className="text-muted-foreground mt-2">
            Amministra gli utenti del sistema.
          </p>
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
  description: 'Amministra gli utenti del sistema',
};