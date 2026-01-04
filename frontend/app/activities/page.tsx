// app/activities/page.tsx
import { Suspense } from "react";
import { ActivityStatsGrid } from "@/components/activity/activity-stats-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityListClient } from "./activity-list-client";

export default async function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attività</h1>
          <p className="text-muted-foreground">
            Gestisci chiamate, meeting e interazioni con i clienti
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <ActivityStatsGridWrapper />
      </Suspense>

      {/* Lista Attività con Filtri */}
      <Suspense fallback={<div>Caricamento attività...</div>}>
        <ActivityListClient />
      </Suspense>
    </div>
  );
}

// Wrapper per fetch stats lato server
async function ActivityStatsGridWrapper() {
  // Se vuoi fetch server-side, altrimenti usa direttamente il client component
  return <ActivityStatsGrid />;
}

function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
