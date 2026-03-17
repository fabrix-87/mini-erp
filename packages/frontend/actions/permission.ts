// packages/frontend/actions/permission-actions.ts
'use server';

import { roleRevalidation } from '@/lib/server/revalidate';
import { createPermission, updatePermission, deletePermission } from '@/services/server/permission';
import type { CreatePermissionInput, UpdatePermissionInput } from '@mini-erp/shared';
import { withAuth, type ActionResult } from '@/lib/server/action';

export async function createPermissionAction(data: CreatePermissionInput): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const permission = await createPermission(data);
    roleRevalidation.list();
    return permission;
  }, 'role:create');
  if (result.success) result.message = 'Permesso creato con successo';
  return result;
}

export async function updatePermissionAction(id: number, data: UpdatePermissionInput): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const permission = await updatePermission(id, data);
    roleRevalidation.list();
    return permission;
  }, 'role:update');
  if (result.success) result.message = 'Permesso aggiornato con successo';
  return result;
}

export async function deletePermissionAction(id: number): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await deletePermission(id);
    roleRevalidation.list();
    return null;
  }, 'role:delete');
  if (result.success) result.message = 'Permesso eliminato con successo';
  return result;
}
