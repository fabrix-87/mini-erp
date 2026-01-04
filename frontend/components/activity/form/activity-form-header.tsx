// components/activity/form/activity-form-header.tsx
"use client";

import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityFormHeaderProps {
  isEditMode: boolean;
  isPending: boolean;
  onCancel: () => void;
}

export function ActivityFormHeader({
  isEditMode,
  isPending,
  onCancel,
}: ActivityFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Modifica Attività" : "Nuova Attività"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Aggiorna i dettagli dell'attività"
              : "Registra una nuova attività o interazione"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Salvataggio..." : "Salva"}
        </Button>
      </div>
    </div>
  );
}
