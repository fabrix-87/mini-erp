import { LockKeyhole } from "lucide-react";
import { LoginForm } from "./components/login-form";
import { getTranslations } from "next-intl/server";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

/**
 * Renders the user authentication page.
 *
 * @param searchParams - Optional authenticated redirect destination.
 * @returns Login page content.
 */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const { callbackUrl } = await searchParams;
  const t = await getTranslations("common.auth");

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
      <div className="mb-8 space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("login")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
        </div>
      </div>

      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
