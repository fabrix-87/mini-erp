// app/settings/users/[id]/page.tsx
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin, requirePermission } from '@/lib/server/auth';
import { getUserById } from '@/services/server/user';
import { ServerApiError } from '@/types/server-client';
import { UserDetailHeader } from '@/components/users/user-detail-header';
import { UserDetailInfo } from '@/components/users/user-detail-info';
import { UserDetailActions } from '@/components/users/user-detail-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function UserDetailContent({ userId }: { userId: number }) {
  try {
    const user = await getUserById(userId, { revalidate: 30 });

    return (
      <>
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

function UserDetailSkeleton() {
  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    </>
  );
}

export default async function UserDetailPage({ params }: PageProps) {
  // Authorization Check
  try {
    await requirePermission('user:read');
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 401) {
      redirect('/login');
    }
    if (error instanceof ServerApiError && error.statusCode === 403) {
      redirect('/dashboard');
    }
    throw error;
  }
  
  const { id } = await params;

  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

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

        {/* Content with Suspense */}
        <Suspense fallback={<UserDetailSkeleton />}>
          <UserDetailContent userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  try {
    await requirePermission('user:read');

    const { id } = await params;

    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return {
        title: 'Utente Non Trovato | Mini ERP',
      };
    }

    const user = await getUserById(userId);
    
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
