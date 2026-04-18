// components/leads/lead-bulk-toolbar.tsx
"use client";

import { useState } from "react";
import { UserCheck, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { bulkAssignLeadsAction, bulkUpdateLeadStatusAction } from "@/actions/lead";
import type { LeadStatus } from "@mini-erp/shared/constants";

// ============================================================================
// Constants
// ============================================================================

const BULK_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "CONTACTED", label: "Contattato" },
  { value: "QUALIFIED", label: "Qualificato" },
  { value: "UNQUALIFIED", label: "Non qualificato" },
  { value: "NURTURING", label: "Nurturing" },
  { value: "ARCHIVED", label: "Archiviato" },
];

// ============================================================================
// Props
// ============================================================================

interface LeadBulkToolbarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  onSuccess: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Sticky toolbar shown when one or more leads are selected in the table.
 * Supports bulk status update and bulk assign.
 */
export function LeadBulkToolbar({
  selectedIds,
  onClearSelection,
  onSuccess,
}: LeadBulkToolbarProps) {
  const [isPending, setIsPending] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkStatus = async (status: LeadStatus) => {
    setIsPending(true);
    const result = await bulkUpdateLeadStatusAction({
      leadIds: selectedIds,
      status,
    });
    setIsPending(false);
    if (result.success) {
      toast.success(`${selectedIds.length} lead aggiornate a "${status}"`);
      onClearSelection();
      onSuccess();
    } else {
      toast.error(result.error ?? "Errore durante l'aggiornamento");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/60 px-4 py-2 text-sm">
      <Badge variant="secondary" className="text-xs">
        {selectedIds.length} selezionate
      </Badge>

      <div className="flex items-center gap-2">
        {/* Bulk status */}
        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
        <Select onValueChange={(v) => handleBulkStatus(v as LeadStatus)} disabled={isPending}>
          <SelectTrigger className="h-7 w-41.25 text-xs">
            <SelectValue placeholder="Cambia status..." />
          </SelectTrigger>
          <SelectContent>
            {BULK_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-7 text-xs text-muted-foreground"
        onClick={onClearSelection}
        disabled={isPending}
      >
        <X className="mr-1 h-3 w-3" />
        Deseleziona
      </Button>
    </div>
  );
}
