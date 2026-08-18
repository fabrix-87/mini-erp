// components/users/users-content.tsx
"use client";

import { UsersFilterBar } from "@/app/(protected)/admin/users/components/users-filter-bar";
import { UsersTable } from "@/app/(protected)/admin/users/components/users-table";
import { DataPagination } from "@/components/ui/data-pagination";
import { StatisticCard } from "@/components/ui/statistic-card";
import { Users, UserCheck, UserX, Shield, Plus } from "lucide-react";
import { UserListApiResponse, UserStatsResponse } from "@/types/user-types";
import { UserQueryInput } from "@mini-erp/shared";
import { useState } from "react";

interface UsersContentProps {
  queryParams: UserQueryInput;
  usersList: UserListApiResponse;
  stats: UserStatsResponse;
  canCreate: boolean;
}

export default function UsersContent({
  queryParams,
  usersList,
  stats,
}: UsersContentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const users = usersList.data;
  const pagination = usersList.pagination;

  return (
    <div className="space-y-6">      
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
        onPendingChange={setIsLoading}
      />
      {/* Table */}
      <UsersTable users={users} isLoading={isLoading} />

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
    </div>
  );
}
