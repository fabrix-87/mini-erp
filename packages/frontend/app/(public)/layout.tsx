import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Provides the responsive public shell for unauthenticated application pages.
 *
 * @param children - The public route content.
 * @returns The public two-column application layout.
 */
export default async function PublicLayout({
  children,
}: PublicLayoutProps): Promise<React.JSX.Element> {
  const t = await getTranslations("common");
  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <section className="hidden flex-col justify-between border-r border-border bg-background p-10 lg:flex xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {process.env.APP_NAME?.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">{process.env.APP_NAME}</span>
              <span className="text-xs text-muted-foreground">{t("appDescription")}</span>
            </div>
          </div>

          <div className="max-w-md">
            <p className="mb-4 text-sm font-medium text-primary">{t("public.heroEyebrow")}</p>

            <h1 className="text-3xl font-semibold tracking-tight xl:text-4xl">
              {t.rich("public.heroTitle", {
                br: () => <br />,
              })}
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              {t("public.heroDescription")}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {process.env.APP_NAME}</p>
        </section>

        <section className="flex min-h-screen items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
