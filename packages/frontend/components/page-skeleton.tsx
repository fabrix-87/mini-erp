import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  /** Il tipo di layout principale da renderizzare sotto l'header */
  variant?: "table" | "grid" | "form";
  /** Numero di righe o card da mostrare (default: 5 per table, 3 per grid) */
  itemCount?: number;
  /** Mostra o nasconde la barra dei filtri/ricerca */
  withToolbar?: boolean;
}

export function PageSkeleton({
  variant = "table",
  itemCount,
  withToolbar = true,
}: PageSkeletonProps) {
  // Imposta i default in base alla variante scelta
  const effectiveCount = itemCount ?? (variant === "grid" ? 3 : 5);

  return (
    <div className="space-y-6 p-1 sm:p-2 animate-pulse">
      {/* 1. HEADER DELLA PAGINA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-2">
          {/* Titolo della pagina */}
          <Skeleton className="h-7 w-48 sm:w-64" />
          {/* Sottotitolo / Descrizione */}
          <Skeleton className="h-4 w-32 sm:w-40" />
        </div>
        {/* Pulsanti d'azione a destra (es. "Nuovo utente") */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* 2. TOOLBAR (Filtri / Barra di ricerca) */}
      {withToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-1">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            {/* Input di ricerca */}
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex items-center gap-2">
            {/* Select per filtri o ordinamento */}
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}

      {/* 3. CONTENUTO PRINCIPALE (VARIANTI) */}
      {variant === "table" && (
        <div className="rounded-md border border-border/50 overflow-hidden">
          {/* Header della Tabella */}
          <div className="bg-muted/40 p-4 border-b border-border/50 grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4 justify-self-end" />
          </div>
          {/* Righe della Tabella */}
          <div className="divide-y divide-border/40">
            {Array.from({ length: effectiveCount }).map((_, i) => (
              <div key={i} className="p-4 grid grid-cols-4 gap-4 items-center">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-12 justify-self-end rounded-full" />
              </div>
            ))}
          </div>
          {/* Barra di Paginazione finta */}
          <div className="p-4 bg-muted/10 border-t border-border/50 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      )}

      {variant === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: effectiveCount }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "form" && (
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6 shadow-sm max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: effectiveCount }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-9 w-full rounded-md" /> {/* Input */}
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full rounded-md" /> {/* Textarea finta */}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}
    </div>
  );
}
