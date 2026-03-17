import { requirePermission } from "@/lib/server/auth";
import { getRoleById } from "@/services/server/role";
import { permissionKeys, roleKeys } from "@/types/role";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import RoleDetailPage from "@/components/role/role-detail";
import { notFound } from "next/navigation";
import { getAllPermissions } from "@/services/server/permission";

interface RoleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPageRoute({
  params,
}: RoleDetailPageProps) {
  await requirePermission("role:read");

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
      <RoleDetailPage roleId={roleId} />
    </HydrationBoundary>
  );
}
