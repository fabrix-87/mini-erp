// app/settings/users/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/server/auth";
import { getUserById } from "@/services/server/user-service";
import { ServerApiError } from "@/types/server-client";
import { UserDetailHeader } from "@/app/(protected)/admin/users/components/user-detail-header";
import { UserDetailInfo } from "@/app/(protected)/admin/users/components/user-detail-info";
import { UserDetailActions } from "@/app/(protected)/admin/users/components/user-detail-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRoute } from "@/lib/navigation-routes";
import { PageHeader } from "@/components/page-header";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function UserDetailContent({ userId }: { userId: string }) {
  try {
    const user = await getUserById(userId, { revalidate: 30 });

    const fullName = user
      ? `${user.details?.firstName} ${user.details?.lastName}`.trim()
      : undefined; // undefined → PageHeader usa il computedTitle di fallback

    return (
      <>
        <PageHeader
          extraBreadcrumbs={fullName ? [{ label: fullName }] : undefined}
          title={fullName}
        />
        <UserDetailHeader user={user} />
        <UserDetailInfo user={user} />
        <UserDetailActions user={user} />
      </>
    );
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  // Authorization Check
  try {
    await requirePermission("user:read");
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
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href={getRoute("users")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla lista utenti
      </Link>

      <UserDetailContent userId={id} />
    </div>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;

    const user = await getUserById(id);

    return {
      title: `${user.details?.firstName} ${user.details?.lastName} - Dettagli Utente | ${process.env.APP_NAME}`,
      description: `Dettagli e gestione dell'utente ${user.username}`,
    };
  } catch {
    return {
      title: `Dettagli Utente | ${process.env.APP_NAME}`,
    };
  }
}
