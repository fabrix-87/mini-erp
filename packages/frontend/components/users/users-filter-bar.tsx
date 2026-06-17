// frontend/components/users/users-filter-bar.tsx
"use client";

import { useTransition, useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateURL } from "@/hooks/use-update-url";
import { useNavigation } from "@/hooks/use-navigation";

interface UsersFilterBarProps {
  initialSearch?: string;
  initialActive?: boolean | null;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
}

export function UsersFilterBar({
  initialSearch = "",
  initialActive = null,
  initialSortBy = "createdAt",
  initialSortOrder = "desc",
}: UsersFilterBarProps) {
  const { getRoute } = useNavigation();
  const USERS_BASE_PATH = getRoute("users");

  /**
   * updateURL is bound to USERS_BASE_PATH so call sites don't repeat the path.
   * We use replace:true for all filter changes to avoid polluting browser history,
   * and resetPage:true to reset pagination whenever filters change.
   */
  const updateURL = useUpdateURL(USERS_BASE_PATH);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [active, setActive] = useState<string>(
    initialActive === null ? "" : initialActive.toString(),
  );
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  // Debounce della ricerca testuale
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        updateURL({ search }, { replace: true, resetPage: true });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Handles active status filter change.
   * @param value - 'true' | 'false' | '' (empty = tutti)
   */
  const handleActiveChange = (value: string) => {
    setActive(value);
    startTransition(() => {
      updateURL({ active: value || null }, { replace: true, resetPage: true });
    });
  };

  /**
   * Handles sort field change.
   * @param value - Field name to sort by
   */
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    startTransition(() => {
      updateURL({ sortBy: value }, { replace: true });
    });
  };

  /**
   * Handles sort direction change.
   * @param value - 'asc' | 'desc'
   */
  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    startTransition(() => {
      updateURL({ sortOrder: value }, { replace: true });
    });
  };

  /** Resets all filters and navigates to the base users route. */
  const handleClearFilters = () => {
    setSearch("");
    setActive("");
    setSortBy("createdAt");
    setSortOrder("desc");
    startTransition(() => {
      updateURL({}, { clearAll: true, replace: true });
    });
  };

  const hasActiveFilters = search || active || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Filtri</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Attivi
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 text-xs">
              <X className="h-3 w-3 mr-1" />
              Reimposta
            </Button>
          )}
        </div>

        {/* Filtri */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ricerca */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cerca per username o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              disabled={isPending}
            />
          </div>

          {/* Stato */}
          <Select value={active} onValueChange={handleActiveChange} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="true">Solo Attivi</SelectItem>
              <SelectItem value="false">Solo Inattivi</SelectItem>
            </SelectContent>
          </Select>

          {/* Ordinamento */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={handleSortByChange} disabled={isPending}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Data Creazione</SelectItem>
                <SelectItem value="username">Username</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => handleSortOrderChange(v as "asc" | "desc")}
              disabled={isPending}
            >
              <SelectTrigger className="w-25">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">↑ Asc</SelectItem>
                <SelectItem value="desc">↓ Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Aggiornamento in corso...
          </div>
        )}
      </div>
    </div>
  );
}
