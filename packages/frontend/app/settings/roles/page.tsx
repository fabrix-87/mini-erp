import RoleListPage from "@/components/role/role-list";
import { requirePermission } from "@/lib/server/auth";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import { getAllRoles } from "@/services/server/role";
import { roleKeys } from "@/types/role";
import { RoleQueryInput, roleQuerySchema } from "@mini-erp/shared";
import { dehydrate, QueryClient } from "@tanstack/react-query";

interface RolesPageProps {
  searchParams: Promise<RoleQueryInput>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  await requirePermission("role:read");

  const queryClient = new QueryClient();

  const params: RoleQueryInput = roleQuerySchema.parse(await searchParams);

  // Prefetch usando contact-services
  await queryClient.prefetchQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => getAllRoles(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoleListPage />
    </HydrationBoundary>
  );
}
