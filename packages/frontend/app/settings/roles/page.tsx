import RoleListPage from "@/components/role/role-list";
import { requirePermission } from "@/lib/server/auth";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import { getAllRoles } from "@/services/server/role";
import { defaultParams, roleKeys } from "@/types/role";
import { RoleQueryInput } from "@mini-erp/shared";
import { dehydrate, QueryClient } from "@tanstack/react-query";

interface RolesPageProps {
  searchParams: Promise<RoleQueryInput>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  await requirePermission("role:read");

  const queryClient = new QueryClient();
  const resolvedSearchParams = await searchParams;

  const params: RoleQueryInput = {
    page: resolvedSearchParams.page || defaultParams.page,
    limit: resolvedSearchParams.limit || defaultParams.limit,
    isDefault: resolvedSearchParams.isDefault || defaultParams.isDefault,
    search: resolvedSearchParams.search || defaultParams.search,
    sortBy: resolvedSearchParams.sortBy || defaultParams.sortBy,
    sortOrder: resolvedSearchParams.sortOrder || defaultParams.sortOrder,
  };

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
