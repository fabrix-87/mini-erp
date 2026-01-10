// app/activities/activities-client.tsx - Client Component ottimizzato
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ActivityDashboardStats } from "@/types/activitiy";
import { PaginationInfo } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

// Import componenti riutilizzabili
import { ActivityList } from "@/components/activity/activity-list";
import { ActivityCalendarView } from "@/components/activity/activity-calendar-view";
import { ActivityFilters } from "@/components/activity/activity-filters";
import { ActivityStatsGrid } from "@/components/activity/activity-stats-grid";

interface ActivitiesClientProps {
  initialActivities: Activity[];
  initialStats: ActivityDashboardStats | null;
  initialPagination?: PaginationInfo;
  initialFilters: {
    page: number;
    typeFilter: string;
    statusFilter: string;
    priorityFilter: string;
    dateFilter: string;
    searchQuery: string;
  };
}

export default function ActivitiesClient({
  initialActivities,
  initialStats,
  initialPagination,
  initialFilters,
}: ActivitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [viewMode, setViewMode] = useState<"list" | "calendar">(
    (searchParams.get("view") as "list" | "calendar") || "list"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Update URL with new filters
  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/activities?${params.toString()}`);
    });
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: "1" });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as "list" | "calendar");
    updateFilters({ view: mode });
  };

  // Show loading if still checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Caricamento...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attività</h1>
          <p className="text-muted-foreground">
            Gestisci tutte le tue attività e interazioni
          </p>
        </div>
        <Button onClick={() => router.push("/activities/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Attività
        </Button>
      </div>

      {/* Stats Grid - Componente separato */}
      {initialStats && <ActivityStatsGrid stats={initialStats} />}

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={handleViewModeChange}>
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              {/* Filters Component */}
              <ActivityFilters
                searchQuery={initialFilters.searchQuery}
                dateFilter={initialFilters.dateFilter}
                typeFilter={initialFilters.typeFilter}
                statusFilter={initialFilters.statusFilter}
                priorityFilter={initialFilters.priorityFilter}
                onSearchChange={handleSearch}
                onFilterChange={handleFilterChange}
              />
            </CardHeader>
            <CardContent>
              {/* Activity List Component */}
              <ActivityList
                activities={initialActivities}
                isLoading={isPending}
                onActivityClick={(id) => router.push(`/activities/${id}`)}
              />

              {/* Pagination */}
              {initialPagination && initialPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Pagina {initialPagination.currentPage} di {initialPagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(Math.max(1, initialPagination.currentPage - 1))
                      }
                      disabled={initialPagination.currentPage === 1 || isPending}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            initialPagination.totalPages,
                            initialPagination.currentPage + 1
                          )
                        )
                      }
                      disabled={
                        initialPagination.currentPage === initialPagination.totalPages ||
                        isPending
                      }
                    >
                      Successiva
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <ActivityCalendarView
            activities={initialActivities}
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date);
              updateFilters({
                date: "custom",
                customDate: date.toISOString().split("T")[0],
              });
            }}
            isLoading={isPending}
            onActivityClick={(id) => router.push(`/activities/${id}`)}
            onCreateNew={() => router.push("/activities/new")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
