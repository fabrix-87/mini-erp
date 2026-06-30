// packages/frontend/app/(protected)/settings/profile/page.tsx
import { requireAuth } from '@/lib/server/auth';
import { ProfileForm } from './components/profile-form';
import { getUser } from '@/services/server/user-settings-service';

/**
 * Profile tab — renders the user profile edit form.
 * Fetches current user data server-side with the 'user-profile' cache tag.
 */
export default async function ProfilePage() {
  await requireAuth();

  const user = await getUser();

  return <ProfileForm user={user} />;
}