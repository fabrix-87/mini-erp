// packages/frontend/actions/role.ts
"use server";

import { roleRevalidation } from "@/lib/server/revalidate";
import {
  assignPermissions,
  createRole,
  deleteRole,
  removePermissions,
  updateRole,
} from "@/services/server/role";
import { redirect } from "next/navigation";
import type { CreateRoleInput, UpdateRoleInput } from "@mini-erp/shared";
import { withAuth, type ActionResult } from "@/lib/server/action";

export async function createRoleAction(data: CreateRoleInput): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const role = await createRole(data);
    roleRevalidation.list();
    return role;
  }, "role:create");
  if (result.success) result.message = "Ruolo creato con successo";
  return result;
}

export async function updateRoleAction(id: number, data: UpdateRoleInput): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const role = await updateRole(id, data);
    roleRevalidation.role(id);
    return role;
  }, "role:update");
  if (result.success) result.message = "Ruolo aggiornato con successo";
  return result;
}

export async function deleteRoleAction(id: number): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await deleteRole(id);
    roleRevalidation.list();
    return null;
  }, "role:delete");
  if (result.success) redirect("/settings/roles");
  return result;
}

export async function assignPermissionsAction(
  roleId: number,
  data: { permissionIds: number[] },
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const role = await assignPermissions(roleId, data);
    roleRevalidation.role(roleId);
    return role;
  }, "role:update");
  if (result.success) result.message = "Permessi assegnati con successo";
  return result;
}

export async function removePermissionsAction(
  roleId: number,
  data: { permissionIds: number[] },
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const role = await removePermissions(roleId, data);
    roleRevalidation.role(roleId);
    return role;
  }, "role:update");
  if (result.success) result.message = "Permessi rimossi con successo";
  return result;
}
