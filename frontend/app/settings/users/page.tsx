// app/settings/users/page.tsx
import { redirect } from "next/navigation";
import { 
  requireAdmin, 
  requirePermission 
} from "@/lib/server/auth";
import {
  getAllUsers,
  getUserStats,
} from "@/services/server/user";
import { ServerApiError } from "@/types/server-client";


// ============================================================================
// Server Component - Admin Users List
// ============================================================================

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    active?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default async function UsersPage({ searchParams }: PageProps) {
  // ========================================
  // Authorization Check
  // ========================================
  try {
    // Opzione 1: Require admin
    await requireAdmin();

    // Opzione 2: Require specific permission (commentato)
    // await requirePermission('user:read');
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 401) {
      redirect("/login");
    }
    if (error instanceof ServerApiError && error.status === 403) {
      redirect("/dashboard");
    }
    throw error;
  }

  // ========================================
  // Parse Query Params
  // ========================================
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '10', 10);
  const search = searchParams.search || undefined;
  const active = searchParams.active === 'true' ? true 
    : searchParams.active === 'false' ? false 
    : undefined;
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  // ========================================
  // Fetch Data (Parallel)
  // ========================================
  const [usersResponse, stats] = await Promise.all([
    getAllUsers({
      page,
      limit,
      search,
      active,
      sortBy,
      sortOrder,
      revalidate: 30, // Cache 30 seconds
    }),
    getUserStats(),
  ]);

  const { data: users, pagination } = usersResponse;

  // ========================================
  // Render
  // ========================================
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestione Utenti
          </h1>
          <p className="text-muted-foreground mt-2">
            Amministra gli utenti del sistema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Utenti Totali</div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-sm text-muted-foreground">Attivi</div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <div className="text-sm text-muted-foreground">Inattivi</div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(stats.byRole).length}
            </div>
            <div className="text-sm text-muted-foreground">Ruoli</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="rounded-lg border bg-card p-4">
          <form className="flex gap-4">
            <div className="flex-1">
              <input
                type="search"
                name="search"
                placeholder="Cerca utenti..."
                defaultValue={search}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <select
              name="active"
              defaultValue={active?.toString() || ''}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Tutti</option>
              <option value="true">Solo Attivi</option>
              <option value="false">Solo Inattivi</option>
            </select>

            <select
              name="sortBy"
              defaultValue={sortBy}
              className="px-3 py-2 border rounded-md"
            >
              <option value="createdAt">Data Creazione</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Filtra
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Ruoli
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Creato
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        {user.roles?.map((role: any) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {user.active ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <a
                        href={`/users/${user.id}`}
                        className="text-primary hover:underline"
                      >
                        Dettagli
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Pagina {pagination.currentPage} di {pagination.totalPages}
              {' '}({pagination.totalItems} totali)
            </div>

            <div className="flex gap-2">
              {pagination.hasPrevPage && (
                <a
                  href={`/users?page=${pagination.currentPage - 1}&limit=${limit}`}
                  className="px-3 py-1 border rounded-md hover:bg-muted"
                >
                  Precedente
                </a>
              )}

              {pagination.hasNextPage && (
                <a
                  href={`/users?page=${pagination.currentPage + 1}&limit=${limit}`}
                  className="px-3 py-1 border rounded-md hover:bg-muted"
                >
                  Successiva
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400">📊</div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Cache Strategy
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Questa lista viene cachata per 30 secondi. I dati statistici vengono
                rivalidati automaticamente insieme alla lista.
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <div>
                  💡 <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    revalidate: 30
                  </code> - Cache 30 secondi
                </div>
                <div>
                  🏷️ <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    tags: ['users-list']
                  </code> - Invalidazione automatica
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}