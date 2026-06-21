// components/users/users-content.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersFilterBar } from "@/app/admin/users/components/users-filter-bar";
import { UsersTable } from "@/app/admin/users/components/users-table";
import { DataPagination } from "@/components/ui/data-pagination";
import { StatisticCard } from "@/components/ui/statistic-card";
import { Users, UserCheck, UserX, Shield, Plus } from "lucide-react";
import { userKeys, UserListApiResponse, UserStatsResponse } from "@/types/user-types";
import { clientUserService } from "@/services/client/user";
import { UserQueryInput } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { Button } from "@/components/ui/button";

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
  canCreate,
}: UsersContentProps) {
  const { navigateToNew } = useNavigation();

  const users = usersList.data;
  const pagination = usersList.pagination;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Utenti</h1>
          <p className="text-muted-foreground mt-2">Amministra gli utenti del sistema.</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigateToNew("users")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo utente
          </Button>
        )}
      </div>
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
