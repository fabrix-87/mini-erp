// app/activities/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityListClient } from "./activity-list-client";
import { ActivityStatsGridClient } from "./activity-stats-grid-client";

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
        <ActivityStatsGridClient />
      </Suspense>

      {/* Lista Attività con Filtri */}
      <Suspense fallback={<div>Caricamento attività...</div>}>
        <ActivityListClient />
      </Suspense>
    </div>
  );
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
