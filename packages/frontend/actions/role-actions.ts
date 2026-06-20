// packages/frontend/actions/role.ts
"use server";

import { roleRevalidation } from "@/lib/server/revalidate";
import {
  assignPermissions,
  createRole,
  deleteRole,
  removePermissions,
  updateRole,
} from "@/services/server/role-service";
import type { CreateRoleInput, Role, UpdateRoleInput } from "@mini-erp/shared";
import { type ActionResult, withAuth } from "@/lib/server/action";

export async function createRoleAction(data: CreateRoleInput): Promise<ActionResult<Role>> {
  const result = await withAuth(async () => {
    const response = await createRole(data); // RoleSingleApiResponse
    roleRevalidation.list();
    return response;
  }, "role:create");

  return result;
}

export async function updateRoleAction(
  id: number,
  data: UpdateRoleInput,
): Promise<ActionResult<Role>> {
  const result = await withAuth(async () => {
    const role = await updateRole(id, data);
    roleRevalidation.role(id);
    return role;
  }, "role:update");
  if (result.success) result.message = "Ruolo aggiornato con successo";
  return result;
}

export async function deleteRoleAction(id: number): Promise<ActionResult> {
  await withAuth(async () => {
    const response = await deleteRole(id);
    roleRevalidation.list();
    return response;
  }, "role:delete");
  return { success: true };
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
