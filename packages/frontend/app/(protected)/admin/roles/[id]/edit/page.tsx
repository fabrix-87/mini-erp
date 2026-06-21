import { requirePermission } from "@/lib/server/auth";
import { getRoleById } from "@/services/server/role-service";
import { permissionKeys, roleKeys } from "@/types/role-types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import RoleFormPage from "@/app/(protected)/admin/roles/components/role-form";
import { notFound } from "next/navigation";
import { getAllPermissions } from "@/services/server/permission";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  await requirePermission("role:update");

  const { id } = await params;
  const roleId = Number(id);

  if (isNaN(roleId)) notFound();

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: roleKeys.detail(roleId),
      queryFn: () => getRoleById(roleId),
    }),
    queryClient.prefetchQuery({
      queryKey: permissionKeys.list(),
      queryFn: () => getAllPermissions(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoleFormPage mode="edit" roleId={roleId} />
    </HydrationBoundary>
  );
}
