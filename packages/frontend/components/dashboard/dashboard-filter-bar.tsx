// packages/frontend/components/dashboard/dashboard-filter-bar.tsx
"use client";

import { DashboardPeriod, DashboardScope } from "@mini-erp/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, LayoutGrid } from "lucide-react";
import { DashboardQueryParams } from "@/types/dashboard";

/** Human-readable labels for period enum values */
const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  [DashboardPeriod.CURRENT_MONTH]: "Mese corrente",
  [DashboardPeriod.LAST_MONTH]: "Mese scorso",
  [DashboardPeriod.LAST_3_MONTHS]: "Ultimi 3 mesi",
  [DashboardPeriod.CURRENT_QUARTER]: "Trimestre corrente",
  [DashboardPeriod.LAST_QUARTER]: "Trimestre scorso",
  [DashboardPeriod.CURRENT_YEAR]: "Anno corrente",
  [DashboardPeriod.LAST_YEAR]: "Anno scorso",
  [DashboardPeriod.CUSTOM]: "Personalizzato",
};

/** Human-readable labels for scope enum values */
const SCOPE_LABELS: Record<DashboardScope, string> = {
  [DashboardScope.OWN]: "Solo miei",
  [DashboardScope.TEAM]: "Team",
  [DashboardScope.ALL]: "Tutti",
};

interface DashboardFilterBarProps {
  params: DashboardQueryParams;
  /** Scopes visibili all'utente corrente (filtrati per ruolo) */
  allowedScopes: DashboardScope[];
  onChange: (params: Partial<DashboardQueryParams>) => void;
  onResetLayout: () => void;
  onToggleEditMode: () => void;
  isEditMode: boolean;
  isSaving: boolean;
}

/**
 * Dashboard header bar with period/scope selectors and layout controls.
 */
export function DashboardFilterBar({
  params,
  allowedScopes,
  onChange,
  onResetLayout,
  onToggleEditMode,
  isEditMode,
  isSaving,
}: DashboardFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-2">
        {/* Period selector */}
        <Select
          value={params.period ?? DashboardPeriod.CURRENT_MONTH}
          onValueChange={(val) => onChange({ period: val as DashboardPeriod })}
        >
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Scope selector — only shown if user has access to more than OWN */}
        {allowedScopes.length > 1 && (
          <Select
            value={params.scope ?? DashboardScope.OWN}
            onValueChange={(val) => onChange({ scope: val as DashboardScope })}
          >
            <SelectTrigger className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedScopes.map((scope) => (
                <SelectItem key={scope} value={scope}>
                  {SCOPE_LABELS[scope]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Reset layout */}
        <Button variant="outline" size="sm" onClick={onResetLayout} disabled={isSaving}>
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset layout
        </Button>

        {/* Toggle edit/drag mode */}
        <Button variant={isEditMode ? "default" : "outline"} size="sm" onClick={onToggleEditMode}>
          <LayoutGrid className="h-4 w-4 mr-1.5" />
          {isEditMode ? "Salva layout" : "Personalizza"}
        </Button>
      </div>
    </div>
  );
}
