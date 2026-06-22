"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionDialogState } from "@/types/role-types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PermissionDialogProps {
  state: PermissionDialogState;
  onClose: () => void;
  onSave: (
    data: { code: string; resource: string; action: string; description?: string },
    id?: number,
  ) => Promise<void>;
  isSaving: boolean;
}

export function PermissionDialog({ state, onClose, onSave, isSaving }: PermissionDialogProps) {
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [description, setDescription] = useState("");

  // Sincronizza lo stato in modo robusto ad ogni apertura/cambio modalità
  useEffect(() => {
    if (state.open) {
      setResource(state.permission?.resource ?? "");
      setAction(state.permission?.action ?? "");
      setDescription(state.permission?.description ?? "");
    }
  }, [state.permission, state.open]);

  // Genera il codice in tempo reale pulendo gli spazi a scopo puramente visivo
  const displayResource = resource.trim().toLowerCase().replace(/\s+/g, "");
  const displayAction = action.trim().toLowerCase().replace(/\s+/g, "");
  const generatedCode =
    displayResource && displayAction ? `${displayResource}:${displayAction}` : "";

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault(); // Blocca il reload della pagina nativo

    if (!displayResource || !displayAction) return;

    await onSave(
      {
        code: generatedCode,
        resource: displayResource,
        action: displayAction,
        description: description.trim() || undefined,
      },
      state.permission?.id,
    );
  };

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state.mode === "create" ? "Nuovo permesso" : "Modifica permesso"}
          </DialogTitle>
        </DialogHeader>

        {/* Usiamo un form nativo per abilitare l'invio tramite tasto Enter */}
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <fieldset disabled={isSaving} className="space-y-4 disabled:opacity-80">
            <div className="space-y-1.5">
              <Label htmlFor="perm-resource">Risorsa</Label>
              <Input
                id="perm-resource"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                placeholder="es. user, role, document"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="perm-action">Azione</Label>
              <Input
                id="perm-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="es. read, create, update, delete"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="perm-desc">Descrizione (opzionale)</Label>
              <Input
                id="perm-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione del permesso"
              />
            </div>
          </fieldset>
          <p className="text-xs text-muted-foreground">
            Codice generato:{" "}
            <code className="font-mono bg-muted px-1 rounded text-primary">
              {generatedCode || "resource:action"}
            </code>
          </p>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={!displayResource || !displayAction || isSaving}
              className="min-w-21.25"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio
                </>
              ) : (
                "Salva"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
