// components/users/users-content.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersFilterBar } from "@/components/users/users-filter-bar";
import { UsersTable } from "@/components/users/users-table";
import { DataPagination } from "@/components/ui/data-pagination";
import { StatisticCard } from "@/components/ui/statistic-card";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { userKeys } from "@/types/user";
import { clientUserService } from "@/services/client/user";
import { UserQueryInput } from "@mini-erp/shared";

interface UsersContentProps {
  queryParams: UserQueryInput;
}

export default function UsersContent({ queryParams }: UsersContentProps) {
  const { data: usersResponse } = useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => clientUserService.getAll(queryParams),
    staleTime: 30 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => clientUserService.getStats(),
    staleTime: 60 * 1000,
  });

  const users = usersResponse?.data ?? [];
  const pagination = usersResponse?.pagination ?? null;

  return (
    <>
      {/* Statistics Cards */}
      {stats && (
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
      )}

      {/* Filters */}
      <UsersFilterBar
        initialSearch={queryParams.search}
        initialActive={queryParams.active}
        initialSortBy={queryParams.sortBy}
        initialSortOrder={queryParams.sortOrder}
      />

      {/* Table */}
      <UsersTable users={users} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={queryParams.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel="utenti"
        />
      )}
    </>
  );
}