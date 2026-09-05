// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-actions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2, Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OpportunityComplete } from "@mini-erp/shared";

interface Props { opportunity: OpportunityComplete; }

/**
 * Client island for opportunity detail page actions (Edit, Win, Lose, Delete).
 * Placed here to avoid making the entire detail page a Client Component.
 */
export function OpportunityDetailActions({ opportunity }: Props) {
  const router = useRouter();
  const isCloseable = opportunity.status === "OPEN" || opportunity.status === "PENDING";

  return (
    <div className="flex items-center gap-2 shrink-0">
      {isCloseable && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => router.push(`/crm/opportunities/${opportunity.id}/win`)}
          >
            <Trophy className="h-4 w-4 mr-1.5" />
            Vinta
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={() => router.push(`/crm/opportunities/${opportunity.id}/lose`)}
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Persa
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/crm/opportunities/${opportunity.id}/edit`)}
      >
        <Pencil className="h-4 w-4 mr-1.5" />
        Modifica
      </Button>
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Elimina opportunità</span>
      </Button>
    </div>
  );
}