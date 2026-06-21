// components/leads/lead-filters.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus, LeadSource, LeadQuality } from "@mini-erp/shared/constants";
import { useAppSearchParams } from "@/providers/search-params-provider";

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS: { value: LeadStatus | "ALL"; label: string }[] = [
  { value: "ALL",         label: "Tutti gli status" },
  { value: "NEW",         label: "Nuovo" },
  { value: "CONTACTED",   label: "Contattato" },
  { value: "QUALIFIED",   label: "Qualificato" },
  { value: "UNQUALIFIED", label: "Non qualificato" },
  { value: "NURTURING",   label: "Nurturing" },
  { value: "CONVERTED",   label: "Convertito" },
  { value: "LOST",        label: "Perso" },
  { value: "DUPLICATE",   label: "Duplicato" },
  { value: "ARCHIVED",    label: "Archiviato" },
];

const SOURCE_OPTIONS: { value: LeadSource | "ALL"; label: string }[] = [
  { value: "ALL",             label: "Tutte le fonti" },
  { value: "WEBSITE",         label: "Website" },
  { value: "REFERRAL",        label: "Referral" },
  { value: "SOCIAL_MEDIA",    label: "Social Media" },
  { value: "EMAIL_CAMPAIGN",  label: "Email Campaign" },
  { value: "PHONE_CALL",      label: "Telefono" },
  { value: "COLD_CALL",       label: "Cold Call" },
  { value: "EVENT",           label: "Evento" },
  { value: "PARTNER",         label: "Partner" },
  { value: "ADVERTISING",     label: "Pubblicità" },
  { value: "CONTENT",         label: "Contenuto" },
  { value: "DIRECT",          label: "Diretto" },
  { value: "CHAT",            label: "Chat" },
  { value: "OTHER",           label: "Altro" },
];

const QUALITY_OPTIONS: { value: LeadQuality | "ALL"; label: string }[] = [
  { value: "ALL",  label: "Tutte le qualità" },
  { value: "HOT",  label: "🔥 Hot" },
  { value: "WARM", label: "♨️ Warm" },
  { value: "COLD", label: "❄️ Cold" },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Lead list filters — search, status, source, quality.
 * Syncs filter state via URL search params for SSR compatibility.
 */
export function LeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useAppSearchParams();
  const [isPending, startTransition] = useTransition();

  const search  = searchParams.get("search") ?? "";
  const status  = searchParams.get("status") ?? "ALL";
  const source  = searchParams.get("source") ?? "ALL";
  const quality = searchParams.get("quality") ?? "ALL";

  const hasActiveFilters = !!(
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("source") ||
    searchParams.get("quality")
  );

  /** Update a single search param, resetting page to 1 */
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-50 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cerca per nome, email, P.IVA..."
          className="pl-8"
          defaultValue={search}
          disabled={isPending}
          onChange={(e) => setParam("search", e.target.value)}
        />
      </div>

      {/* Status */}
      <Select
        value={status}
        onValueChange={(v) => setParam("status", v)}
        disabled={isPending}
      >
        <SelectTrigger className="w-43.75">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Source */}
      <Select
        value={source}
        onValueChange={(v) => setParam("source", v)}
        disabled={isPending}
      >
        <SelectTrigger className="w-43.75">
          <SelectValue placeholder="Fonte" />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quality */}
      <Select
        value={quality}
        onValueChange={(v) => setParam("quality", v)}
        disabled={isPending}
      >
        <SelectTrigger className="w-37.5">
          <SelectValue placeholder="Qualità" />
        </SelectTrigger>
        <SelectContent>
          {QUALITY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={isPending}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Resetta
        </Button>
      )}
    </div>
  );
}