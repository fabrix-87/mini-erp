"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionDialogState } from "@/types/role-types";
import { useEffect, useState } from "react";

interface PermissionDialogProps {
  state: PermissionDialogState;
  onClose: () => void;
  onSave: (
    data: { code: string; resource: string; action: string; description?: string },
    id?: number
  ) => Promise<void>;
  isSaving: boolean;
}

export function PermissionDialog({ state, onClose, onSave, isSaving }: PermissionDialogProps) {
  const [resource, setResource] = useState(state.permission?.resource ?? "");
  const [action, setAction] = useState(state.permission?.action ?? "");
  const [description, setDescription] = useState(
    state.permission?.description ?? ""
  );

  useEffect(() => {
    setResource(state.permission?.resource ?? "");
    setAction(state.permission?.action ?? "");
    setDescription(state.permission?.description ?? "");
  }, [state.permission]);

  // Codice generato automaticamente da resource + action
  const generatedCode = resource && action ? `${resource}:${action}` : "";

  const handleSave = async () => {
    if (!generatedCode) return;
    await onSave(
      { code: generatedCode, resource, action, description: description || undefined },
      state.permission?.id
    );
  };

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state.mode === "create" ? "Nuovo permesso" : "Modifica permesso"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="perm-resource">Risorsa</Label>
            <Input
              id="perm-resource"
              value={resource}
              onChange={(e) => setResource(e.target.value.toLowerCase())}
              placeholder="es. user, role, document"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="perm-action">Azione</Label>
            <Input
              id="perm-action"
              value={action}
              onChange={(e) => setAction(e.target.value.toLowerCase())}
              placeholder="es. read, create, update, delete"
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
          <p className="text-xs text-muted-foreground">
            Codice generato:{" "}
            <code className="font-mono bg-muted px-1 rounded">
              {generatedCode || "resource:action"}
            </code>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={!resource || !action || isSaving}
          >
            {isSaving ? "Salvataggio..." : "Salva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
