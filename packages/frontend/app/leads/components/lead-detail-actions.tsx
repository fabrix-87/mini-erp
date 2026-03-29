// app/leads/[id]/components/lead-detail-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  MoreVertical,
  RefreshCw,
  Target,
  ArrowRight,
  UserCheck,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateLeadStatusAction, deleteLeadAction } from "@/actions/lead";
import type { Lead } from "@/types/lead";

// ============================================================================
// Lazy-loaded dialogs (prevent loading on server)
// ============================================================================

import dynamic from "next/dynamic";

const LeadStatusDialog = dynamic(() =>
  import("@/components/leads/lead-status-dialog").then((m) => m.LeadStatusDialog),
);
const LeadScoreDialog = dynamic(() =>
  import("@/components/leads/lead-score-dialog").then((m) => m.LeadScoreDialog),
);
const LeadQualifyDialog = dynamic(() =>
  import("@/components/leads/lead-qualify-dialog").then((m) => m.LeadQualifyDialog),
);
const LeadConvertDialog = dynamic(() =>
  import("@/components/leads/lead-convert-dialog").then((m) => m.LeadConvertDialog),
);
const LeadAssignDialog = dynamic(() =>
  import("@/components/leads/lead-assign-dialog").then((m) => m.LeadAssignDialog),
);

// ============================================================================
// Component
// ============================================================================

interface LeadDetailActionsProps {
  lead: Lead;
}

/**
 * Client island for lead detail page interactive actions.
 * All dialogs are lazy-loaded to keep SSR bundle lean.
 */
export function LeadDetailActions({ lead }: LeadDetailActionsProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<
    "status" | "score" | "qualify" | "convert" | "assign" | null
  >(null);

  const isConverted = lead.status === "CONVERTED";

  return (
    <>
      {/* Primary CTA */}
      {!isConverted && (
        <Button onClick={() => setOpenDialog("convert")}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Converti in Cliente
        </Button>
      )}

      {/* Edit */}
      <Button variant="outline" asChild>
        <Link href={`/leads/${lead.id}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifica
        </Link>
      </Button>

      {/* More actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenDialog("status")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Cambia status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("score")}>
            <Gauge className="mr-2 h-4 w-4" />
            Aggiorna score
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("qualify")}>
            <Target className="mr-2 h-4 w-4" />
            Qualifica BANT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("assign")}>
            <UserCheck className="mr-2 h-4 w-4" />
            Assegna utente
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              const res = await deleteLeadAction(lead.id);
              if (res.success) {
                toast.success("Lead eliminata");
                router.push("/leads");
              } else {
                toast.error(res.error ?? "Errore durante l'eliminazione");
              }
            }}
          >
            Elimina lead
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {openDialog === "status" && (
        <LeadStatusDialog lead={lead} open onOpenChange={(o) => !o && setOpenDialog(null)} />
      )}
      {openDialog === "score" && (
        <LeadScoreDialog lead={lead} open onOpenChange={(o) => !o && setOpenDialog(null)} />
      )}
      {openDialog === "qualify" && (
        <LeadQualifyDialog lead={lead} open onOpenChange={(o) => !o && setOpenDialog(null)} />
      )}
      {openDialog === "convert" && (
        <LeadConvertDialog lead={lead} open onOpenChange={(o) => !o && setOpenDialog(null)} />
      )}
      {openDialog === "assign" && (
        <LeadAssignDialog lead={lead} open onOpenChange={(o) => !o && setOpenDialog(null)} />
      )}
    </>
  );
}
