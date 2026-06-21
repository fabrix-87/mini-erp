// app/settings/users/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/server/auth";
import { getUserById } from "@/services/server/user-service";
import { ServerApiError } from "@/types/server-client";
import { UserForm } from "@/app/(protected)/admin/users/components/user-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAllRoles } from "@/services/server/role-service";
import { getAllLanguages } from "@/services/server/language";
import { getDetailRoute } from "@/lib/navigation-routes";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditUserContent({ userId }: { userId: string }) {
  const { data: roles } = await getAllRoles({
    page: 1,
    limit: 100,
    sortOrder: "asc",
    sortBy: "code",
  });

  const { data: languages } = await getAllLanguages();

  try {
    const user = await getUserById(userId, { revalidate: 0 });
    return <UserForm user={user} mode="edit" roles={roles} languages={languages} />;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}



export default async function EditUserPage({ params }: PageProps) {
  // Authorization Check
  try {
    await requirePermission("user:update");
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 401) {
      redirect("/login");
    }
    if (error instanceof ServerApiError && error.statusCode === 403) {
      redirect("/dashboard");
    }
    throw error;
  }

  const { id } = await params;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Link
          href={getDetailRoute('users', id)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai dettagli utente
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Utente</h1>
          <p className="text-muted-foreground mt-2">Aggiorna le informazioni dell'utente</p>
        </div>

        {/* Form */}
        <EditUserContent userId={id} />
      </div>
    </div>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  try {
    await requirePermission("user:update");

    const { id } = await params;

    const user = await getUserById(id);

    return {
      title: `Modifica ${user.username} | Mini ERP`,
      description: `Modifica le informazioni dell'utente ${user.username}`,
    };
  } catch {
    return {
      title: "Modifica Utente | Mini ERP",
    };
  }
}
