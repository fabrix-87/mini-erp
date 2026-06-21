import { requirePermission } from "@/lib/server/auth";
import { permissionKeys } from "@/types/role-types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import RoleFormPage from "@/app/(protected)/admin/roles/components/role-form";
import { getAllPermissions } from "@/services/server/permission";

export default async function NewRolePage() {
  await requirePermission("role:create");

  const queryClient = new QueryClient();

  // Prefetch all permissions for the permission picker
  await queryClient.prefetchQuery({
    queryKey: permissionKeys.list(),
    queryFn: () => getAllPermissions(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoleFormPage mode="create" />
    </HydrationBoundary>
  );
}
