"use client";

import { useState } from "react";
import { LeadStatsBar } from "@/components/lead/lead-stats-bar";
import { LeadFilters } from "@/components/lead/lead-filters";
import { LeadTable } from "@/components/lead/lead-table";
import type { Lead, LeadQueryInput, LeadStats } from "@/types/lead-types";
import { EntityPermissions, PaginationInfo } from "@mini-erp/shared";

interface LeadListProps {
  leads: Lead[];
  stats: LeadStats;
  pagination: PaginationInfo;
  searchParams: LeadQueryInput;
  permissions: EntityPermissions;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Client Component — handles state, data fetching, sorting for the lead list.
 * Kept separate from the Server Component page to allow Suspense boundaries.
 */
export function LeadListPage({
  leads,
  stats,
  pagination,
  searchParams,
  permissions,
}: LeadListProps) {
  const [isLoading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <LeadStatsBar stats={stats} />

      {/* Table card */}
      <LeadFilters searchParams={searchParams} onPendingChange={setLoading} />
      <LeadTable
        data={leads}
        pagination={pagination}
        isLoading={isLoading}
        sortField={searchParams.sortBy}
        sortOrder={searchParams.sortOrder}
        permissions={permissions}
      />
    </div>
  );
}
