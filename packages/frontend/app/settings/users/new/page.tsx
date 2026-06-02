// app/settings/users/new/page.tsx
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/server/auth";
import { ServerApiError } from "@/types/server-client";
import { UserForm } from "@/components/users/user-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAllRoles } from "@/services/server/role-service";
import { getAllLanguages } from "@/services/server/language";

export default async function NewUserPage() {
  // Authorization Check
  try {
    await requirePermission("user:create");
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 401) {
      redirect("/login");
    }
    if (error instanceof ServerApiError && error.statusCode === 403) {
      redirect("/dashboard");
    }
    throw error;
  }

  const { data: roles } = await getAllRoles({
    page: 1,
    limit: 100,
    sortOrder: "asc",
    sortBy: "code",
  });

  const { data: languages } = await getAllLanguages();

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Link
          href="/settings/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla lista utenti
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuovo Utente</h1>
          <p className="text-muted-foreground mt-2">Crea un nuovo utente nel sistema</p>
        </div>

        {/* Form */}
        <UserForm mode="create" roles={roles} languages={languages}/>
      </div>
    </div>
  );
}

// Metadata
export const metadata = {
  title: "Nuovo Utente",
  description: "Crea un nuovo utente nel sistema",
};
