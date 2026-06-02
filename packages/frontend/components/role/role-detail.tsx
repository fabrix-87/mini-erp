"use client";

import { useMemo, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Shield,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePermissionMutations, usePermissions, useRole } from "@/hooks/use-role";
import { deleteRoleAction } from "@/actions/role-actions";
import { Permission } from "@mini-erp/shared";
import { formatDate } from "@/utils/format";
import { RoleDetailProps } from "@/types/role-types";
import DeleteDialog from "../dialog/delete-dialog";

// ============================================================================
// HELPER: group by resource
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
// MAIN COMPONENT
// ============================================================================

export default function RoleDetailPage({ roleId }: RoleDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { role, loading, error } = useRole(roleId);

  const { permissions: allPermissions, loading: permLoading } = usePermissions();
  const { assignPermissionsToRole, removePermissionsFromRole, isAssigning, isRemoving } =
    usePermissionMutations();

  // ── Selected permission IDs (for the assign tab) ───────────────────────────
  const assignedIds = useMemo(
    () => new Set<number>((role?.permissions ?? []).map((p: Permission) => p.id)),
    [role],
  );

  const [pendingIds, setPendingIds] = useState<Set<number> | null>(null);

  // Lazily init pending from assigned when assign tab is opened
  const effectiveIds = pendingIds ?? assignedIds;

  const togglePending = (id: number) => {
    const base = pendingIds ?? new Set(assignedIds);
    const next = new Set(base);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPendingIds(next);
  };

  const toggleResourcePending = (perms: Permission[]) => {
    const base = pendingIds ?? new Set(assignedIds);
    const allSel = perms.every((p) => base.has(p.id));
    const next = new Set(base);
    if (allSel) perms.forEach((p) => next.delete(p.id));
    else perms.forEach((p) => next.add(p.id));
    setPendingIds(next);
  };

  const handleSavePermissions = async () => {
    if (!pendingIds) return;
    const toAdd = [...pendingIds].filter((id) => !assignedIds.has(id));
    const toRemove = [...assignedIds].filter((id) => !pendingIds.has(id));

    if (toAdd.length > 0) {
      await assignPermissionsToRole(roleId, { permissionIds: toAdd });
    }
    if (toRemove.length > 0) {
      await removePermissionsFromRole(roleId, { permissionIds: toRemove });
    }
    setPendingIds(null);
  };

  // ── Delete role ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteRoleAction(roleId); // redirects internally
    if (result.success) {
      redirect('/settings/roles')
    }
  };

  // ── Grouped permissions for detail view ───────────────────────────────────
  const assignedGrouped = useMemo(() => groupByResource(role?.permissions ?? []), [role]);
  const allGrouped = useMemo(() => groupByResource(allPermissions), [allPermissions]);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-muted-foreground">{error ?? "Ruolo non trovato"}</p>
        <Button onClick={() => router.push("/settings/roles")}>Torna ai ruoli</Button>
      </div>
    );
  }

  const hasPendingChanges = pendingIds !== null;

  return (
    <div className="space-y-6">
      <BreadcrumbSetter title={`${role.name} (${role.code})`} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings/roles")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{role.name}</h1>
              <Badge variant="outline" className="font-mono text-sm">
                {role.code}
              </Badge>
              {role.isDefault && (
                <Badge variant="secondary">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Predefinito
                </Badge>
              )}
            </div>
            {role.description && <p className="text-muted-foreground mt-0.5">{role.description}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push(`/settings/roles/${roleId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/settings/roles/${roleId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina ruolo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permessi</p>
                <p className="text-2xl font-bold">{role.permissions?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utenti assegnati</p>
                <p className="text-2xl font-bold">{role.userCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Creato il</p>
              <p className="font-medium">{formatDate(role.createdAt)}</p>
              <p className="text-xs text-muted-foreground">
                Modificato: {formatDate(role.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permessi assegnati</TabsTrigger>
          <TabsTrigger value="assign">Gestisci permessi</TabsTrigger>
        </TabsList>

        {/* Tab: Permissions overview */}
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Permessi del ruolo</CardTitle>
              <CardDescription>
                Elenco dei permessi attualmente assegnati, raggruppati per risorsa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(role.permissions?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="mx-auto h-10 w-10 mb-3 opacity-30" />
                  <p>Nessun permesso assegnato a questo ruolo.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push(`/settings/roles/${roleId}/edit`)}
                  >
                    Assegna permessi
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(assignedGrouped).map(([resource, perms]) => (
                    <div key={resource}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold capitalize">{resource}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {perms.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-2">
                        {perms.map((p) => (
                          <Badge
                            key={p.id}
                            variant="outline"
                            className="font-mono text-xs"
                            title={p.description ?? undefined}
                          >
                            {p.resource}:{p.action}
                          </Badge>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Assign permissions */}
        <TabsContent value="assign" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestisci permessi</CardTitle>
                  <CardDescription>
                    Seleziona i permessi da assegnare o rimuovere.{" "}
                    {hasPendingChanges && (
                      <span className="text-amber-600 font-medium">Modifiche non salvate</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {hasPendingChanges && (
                    <Button variant="outline" size="sm" onClick={() => setPendingIds(null)}>
                      Annulla modifiche
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={!hasPendingChanges || isAssigning || isRemoving}
                    onClick={handleSavePermissions}
                  >
                    {isAssigning || isRemoving ? "Salvataggio..." : "Salva permessi"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/settings/roles/${roleId}/edit`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Gestisci lista permessi
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {permLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(allGrouped).map(([resource, perms]) => {
                    const allSel = perms.every((p) => effectiveIds.has(p.id));
                    const someSel = !allSel && perms.some((p) => effectiveIds.has(p.id));
                    return (
                      <div key={resource}>
                        <div className="flex items-center gap-3 mb-3">
                          <Checkbox
                            id={`assign-res-${resource}`}
                            checked={allSel}
                            data-state={someSel ? "indeterminate" : undefined}
                            onCheckedChange={() => toggleResourcePending(perms)}
                          />
                          <Label
                            htmlFor={`assign-res-${resource}`}
                            className="font-semibold capitalize cursor-pointer"
                          >
                            {resource}
                          </Label>
                          <Badge variant="secondary" className="text-xs">
                            {perms.filter((p) => effectiveIds.has(p.id)).length}/{perms.length}
                          </Badge>
                        </div>
                        <div className="ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={`assign-perm-${perm.id}`}
                                checked={effectiveIds.has(perm.id)}
                                onCheckedChange={() => togglePending(perm.id)}
                              />
                              <Label
                                htmlFor={`assign-perm-${perm.id}`}
                                className="cursor-pointer font-mono text-sm"
                                title={perm.description ?? undefined}
                              >
                                {perm.resource}:{perm.action}
                              </Label>
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
        </TabsContent>
      </Tabs>

      {/* ── Delete confirmation ── */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleDelete={handleDelete}
        title="Elimina ruolo"
        isDeleting={isDeleting}
      >
        Sei sicuro di voler eliminare il ruolo <strong>{role.name}</strong>? Questa operazione non
        può essere annullata e rimuoverà il ruolo da tutti gli utenti associati.
      </DeleteDialog>
    </div>
  );
}
