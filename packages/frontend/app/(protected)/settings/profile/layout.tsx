// packages/frontend/app/(protected)/settings/profile/layout.tsx
import type { ReactNode } from "react";
import { SettingsNav } from "./components/settings-nav";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";

interface SettingsProfileLayoutProps {
  children: ReactNode;
}

/**
 * Layout for the settings/profile section.
 * Renders the tab navigation alongside the active tab content.
 */
export default async function SettingsProfileLayout({ children }: SettingsProfileLayoutProps) {
  const t = await getTranslations("settings.profile");
  return (
    <div className="container max-w-4xl py-8 space-y-1">
      <PageHeader title={t("pageTitle")} subtitle={t("pageDescription")} />
      <SettingsNav />
      <div className="pt-4 pb-10">{children}</div>
    </div>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("settings.profile");

  return {
    title: `${t("pageTitle")} | ${process.env.APP_NAME}`,
    description: t("pageDescription"),
  };
}
