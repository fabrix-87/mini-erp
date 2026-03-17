"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  usePermissionMutations,
  usePermissions,
  useRole,
  useRoleMutations,
} from "@/hooks/use-role";
import { createRoleAction, updateRoleAction } from "@/actions/role";
import {
  createPermissionAction,
  deletePermissionAction,
  updatePermissionAction,
} from "@/actions/permission";
import { CreateRoleInput, Permission } from "@mini-erp/shared";
import { PermissionDialogState, RoleFormProps, RoleFormValues } from "@/types/role";
import { PermissionDialog } from "./role-form/permission-dialog";

// ============================================================================
// HELPER: group permissions by resource
// ============================================================================

function groupByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const resource = p.resource ?? "other";
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(p);
    return acc;
  }, {});
}

// ============================================================================
// MAIN COMPONENT: RoleFormPage
// ============================================================================

export default function RoleFormPage({ mode, roleId }: RoleFormProps) {
  const router = useRouter();

  // ── Role data (edit only) ──────────────────────────────────────────────────
  const { role, loading: roleLoading } = useRole(roleId ?? 0);
  const { isCreating, isUpdating } = useRoleMutations();

  // ── Permissions ────────────────────────────────────────────────────────────
  const { permissions, loading: permLoading, refetch: refetchPermissions } = usePermissions();
  const {
    isCreating: isCreatingPerm,
    isUpdating: isUpdatingPerm,
    isDeleting: isDeletingPerm,
  } = usePermissionMutations();

  // ── Local form state ───────────────────────────────────────────────────────
  const [formValues, setFormValues] = useState<RoleFormValues>({
    name: "",
    code: "",
    description: "",
    isDefault: false,
  });
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Permission dialog state ────────────────────────────────────────────────
  const [permDialog, setPermDialog] = useState<PermissionDialogState>({
    open: false,
    mode: "create",
    permission: null,
  });
  const [deletePermDialog, setDeletePermDialog] = useState<{
    open: boolean;
    permission: Permission | null;
  }>({ open: false, permission: null });

  // ── Populate form on edit ──────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "edit" && role) {
      setFormValues({
        name: role.name,
        code: role.code,
        description: role.description ?? "",
        isDefault: role.isDefault ?? false,
      });
      const assignedIds = new Set<number>((role.permissions ?? []).map((p: Permission) => p.id));
      setSelectedPermIds(assignedIds);
    }
  }, [role, mode]);

  // ── Grouped permissions for rendering ─────────────────────────────────────
  const grouped = useMemo(() => groupByResource(permissions), [permissions]);

  // ── Toggle permission selection ────────────────────────────────────────────
  const togglePermission = (id: number) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleResource = (resourcePerms: Permission[]) => {
    const allSelected = resourcePerms.every((p) => selectedPermIds.has(p.id));
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        resourcePerms.forEach((p) => next.delete(p.id));
      } else {
        resourcePerms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  // ── Submit role form ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload: CreateRoleInput = {
      name: formValues.name,
      code: formValues.code.toUpperCase(),
      description: formValues.description || undefined,
      isDefault: formValues.isDefault,
      permissionIds: Array.from(selectedPermIds),
    };

    if (mode === "create") {
      const result = await createRoleAction(payload);
      if (result.success && result.id) {
        router.push(`/settings/roles/${result.id}`);
      } else {
        setServerError(result.error ?? "Errore sconosciuto");
      }
    } else if (roleId) {
      const result = await updateRoleAction(roleId, payload);
      if (result.success) {
        router.push(`/settings/roles/${roleId}`);
      } else {
        setServerError(result.error ?? "Errore sconosciuto");
      }
    }
  };

  // ── Permission dialog handlers ─────────────────────────────────────────────
  const handleSavePermission = async (
    data: { code: string; resource: string; action: string; description?: string },
    id?: number,
  ) => {
    if (id) {
      const result = await updatePermissionAction(id, data); // code è opzionale in UpdatePermissionInput
      if (!result.success) return;
    } else {
      const result = await createPermissionAction(data);
      if (!result.success) return;
    }
    await refetchPermissions();
    setPermDialog({ open: false, mode: "create", permission: null });
  };

  const handleDeletePermission = async () => {
    if (!deletePermDialog.permission) return;
    const result = await deletePermissionAction(deletePermDialog.permission.id);
    if (result.success) {
      selectedPermIds.delete(deletePermDialog.permission.id);
      setSelectedPermIds(new Set(selectedPermIds));
      await refetchPermissions();
    }
    setDeletePermDialog({ open: false, permission: null });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (mode === "edit" && roleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;
  const pageTitle = mode === "create" ? "Nuovo ruolo" : `Modifica ruolo — ${role?.name ?? ""}`;

  return (
    <div className="space-y-6">
      <BreadcrumbSetter title={mode === "create" ? "Nuovo ruolo" : "Modifica ruolo"} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {mode === "create"
                ? "Compila i dati e seleziona i permessi"
                : "Aggiorna i dati del ruolo"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Salvataggio..." : mode === "create" ? "Crea" : "Aggiorna"}
          </Button>
        </div>
      </div>

      {/* ── Server error ── */}
      {serverError && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* ── Role info card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni ruolo</CardTitle>
          <CardDescription>Dati identificativi del ruolo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Nome *</Label>
              <Input
                id="role-name"
                value={formValues.name}
                onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                placeholder="es. Amministratore"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-code">Codice *</Label>
              <Input
                id="role-code"
                value={formValues.code}
                onChange={(e) =>
                  setFormValues((v) => ({
                    ...v,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="es. ADMIN"
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-desc">Descrizione</Label>
            <Textarea
              id="role-desc"
              value={formValues.description}
              onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
              placeholder="Descrizione opzionale del ruolo..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="role-default"
              checked={formValues.isDefault}
              onCheckedChange={(checked) => setFormValues((v) => ({ ...v, isDefault: checked }))}
            />
            <Label htmlFor="role-default" className="cursor-pointer">
              Ruolo predefinito per nuovi utenti
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ── Permissions card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permessi</CardTitle>
              <CardDescription>
                Seleziona i permessi da assegnare al ruolo.{" "}
                <span className="font-medium text-foreground">
                  {selectedPermIds.size} selezionati
                </span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPermDialog({ open: true, mode: "create", permission: null })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuovo permesso
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {permLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nessun permesso disponibile. Crea il primo permesso.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([resource, perms]) => {
                const allSelected = perms.every((p) => selectedPermIds.has(p.id));
                const someSelected = !allSelected && perms.some((p) => selectedPermIds.has(p.id));
                return (
                  <div key={resource}>
                    {/* Resource header */}
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        id={`res-${resource}`}
                        checked={allSelected}
                        data-state={someSelected ? "indeterminate" : undefined}
                        onCheckedChange={() => toggleResource(perms)}
                      />
                      <Label
                        htmlFor={`res-${resource}`}
                        className="font-semibold capitalize cursor-pointer"
                      >
                        {resource}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {perms.filter((p) => selectedPermIds.has(p.id)).length}/{perms.length}
                      </Badge>
                    </div>
                    {/* Individual permissions */}
                    <div className="ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={selectedPermIds.has(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <Label
                              htmlFor={`perm-${perm.id}`}
                              className="cursor-pointer font-mono text-sm truncate"
                              title={perm.description ?? undefined}
                            >
                              {perm.action}
                            </Label>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setPermDialog({
                                  open: true,
                                  mode: "edit",
                                  permission: perm,
                                })
                              }
                            >
                              <span className="sr-only">Modifica</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setDeletePermDialog({
                                  open: true,
                                  permission: perm,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Footer actions ── */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvataggio..." : mode === "create" ? "Crea ruolo" : "Aggiorna ruolo"}
        </Button>
      </div>

      {/* ── Permission create/edit dialog ── */}
      <PermissionDialog
        state={permDialog}
        onClose={() => setPermDialog({ open: false, mode: "create", permission: null })}
        onSave={handleSavePermission}
        isSaving={isCreatingPerm || isUpdatingPerm}
      />

      {/* ── Permission delete confirmation ── */}
      <AlertDialog
        open={deletePermDialog.open}
        onOpenChange={(open) => !open && setDeletePermDialog({ open: false, permission: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina permesso</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il permesso{" "}
              <strong>
                {deletePermDialog.permission?.resource}:{deletePermDialog.permission?.action}
              </strong>
              ? Verrà rimosso da tutti i ruoli che lo usano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingPerm ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
