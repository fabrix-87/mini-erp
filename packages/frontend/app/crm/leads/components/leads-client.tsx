// app/leads/_components/leads-client.tsx
"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LeadStatsBar } from "@/components/lead/lead-stats-bar";
import { LeadFilters } from "@/components/lead/lead-filters";
import { LeadTable } from "@/components/lead/lead-table";
import { useLeads, useLeadStats } from "@/hooks/use-lead";
import type { LeadQueryInput } from "@/types/lead";
import type { SortState } from "@/components/ui/sortable-table-head";

// ============================================================================
// Sort field type (mirrors LeadTable)
// ============================================================================

type LeadSortField =
  | "code"
  | "companyName"
  | "status"
  | "quality"
  | "score"
  | "estimatedValue"
  | "nextFollowUpDate"
  | "createdAt"
  | "lastContactDate";

// ============================================================================
// Helpers
// ============================================================================

/** Parse URL search params into a typed LeadQueryInput */
function useLeadQueryParams(): LeadQueryInput {
  const searchParams = useSearchParams();

  return {
    page:     Number(searchParams.get("page") ?? 1),
    limit:    Number(searchParams.get("limit") ?? 20),
    search:   searchParams.get("search") ?? undefined,
    status:   (searchParams.get("status") as LeadQueryInput["status"]) ?? undefined,
    source:   (searchParams.get("source") as LeadQueryInput["source"]) ?? undefined,
    quality:  (searchParams.get("quality") as LeadQueryInput["quality"]) ?? undefined,
    sortBy:   (searchParams.get("sortBy") as LeadQueryInput["sortBy"]) ?? "createdAt",
    sortOrder:(searchParams.get("sortOrder") as LeadQueryInput["sortOrder"]) ?? "desc",
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * Client Component — handles state, data fetching, sorting for the lead list.
 * Kept separate from the Server Component page to allow Suspense boundaries.
 */
export function LeadsClient() {
  const queryParams = useLeadQueryParams();

  const [sort, setSort] = useState<SortState<LeadSortField>>({
    field: (queryParams.sortBy as LeadSortField) ?? "createdAt",
    order: queryParams.sortOrder === "asc" ? "asc" : "desc",
  });

  const params: LeadQueryInput = {
    ...queryParams,
    sortBy: sort.field,
    sortOrder: sort.order,
  };

  const { data: leadsResponse, isLoading, refetch } = useLeads(params);
  const { data: statsResponse, isLoading: isStatsLoading } = useLeadStats();

  const handleSortChange = useCallback((field: LeadSortField) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  const leads      = leadsResponse?.data ?? [];
  const pagination = leadsResponse?.pagination;
  const stats      = statsResponse?.data;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <LeadStatsBar stats={stats} isLoading={isStatsLoading} />

      {/* Table card */}
      <Card>
        <CardHeader className="pb-3">
          <LeadFilters />
        </CardHeader>
        <CardContent className="p-0">
          <LeadTable
            data={leads}
            pagination={pagination}
            isLoading={isLoading}
            sort={sort}
            onSortChange={handleSortChange}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}