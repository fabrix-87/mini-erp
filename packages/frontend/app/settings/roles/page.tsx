import RoleListPage from "@/components/role/role-list";
import { requirePermission } from "@/lib/server/auth";
import { getAllRoles } from "@/services/server/role-service";
import { RoleQueryInput, roleQuerySchema } from "@mini-erp/shared";

interface RolesPageProps {
  searchParams: Promise<RoleQueryInput>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  await requirePermission("role:read");
  
  const params: RoleQueryInput = roleQuerySchema.parse(await searchParams);

  const result = await getAllRoles(params); 

  return (  
    <RoleListPage data={result}/>
  );
}
