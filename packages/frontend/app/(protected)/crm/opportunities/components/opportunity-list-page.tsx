"use client";

import { useState } from "react";
import { OpportunityStatsBar } from "./opportunity-stats-bar";
import { OpportunityFilters } from "./opportunity-filters";
import { OpportunityTable } from "./opportunity-table";
import type { OpportunityListItem, OpportunityQueryInput, OpportunityStats } from "@/types/opportunity-types";
import type { EntityPermissions, PaginationInfo } from "@mini-erp/shared";

interface OpportunityListPageProps {
  opportunities: OpportunityListItem[];
  stats: OpportunityStats;
  pagination: PaginationInfo;
  searchParams: OpportunityQueryInput;
  permissions: EntityPermissions;
}

/**
 * Client shell for the opportunity list page.
 * Owns loading state; delegates rendering to sub-components.
 */
export function OpportunityListPage({
  opportunities,
  stats,
  pagination,
  searchParams,
  permissions,
}: OpportunityListPageProps) {
  const [isLoading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <OpportunityStatsBar stats={stats} />
      <OpportunityFilters searchParams={searchParams} onPendingChange={setLoading} />
      <OpportunityTable
        data={opportunities}
        pagination={pagination}
        isLoading={isLoading}
        sortField={searchParams.sortBy}
        sortOrder={searchParams.sortOrder}
        permissions={permissions}
      />
    </div>
  );
}