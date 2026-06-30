// packages/frontend/app/(protected)/settings/profile/security/page.tsx
import { requireAuth } from '@/lib/server/auth';
import { ChangePasswordForm } from '../components/change-password-form';
import { TwoFactorForm } from '../components/two-factor-form';
import { Separator } from '@/components/ui/separator';
import { getUser } from '@/services/server/user-settings-service';

/**
 * Security tab — password change and 2FA management.
 */
export default async function SecurityPage() {
  await requireAuth();
  const user = await getUser();

  return (
    <div className="space-y-8">
      <ChangePasswordForm />
      <Separator />
      <TwoFactorForm twoFactorEnabled={user.twoFactorEnabled} />
    </div>
  );
}