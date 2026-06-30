// packages/frontend/app/(protected)/settings/profile/layout.tsx
import type { ReactNode } from "react";
import { SettingsNav } from "./components/settings-nav";

interface SettingsProfileLayoutProps {
  children: ReactNode;
}

/**
 * Layout for the settings/profile section.
 * Renders the tab navigation alongside the active tab content.
 */
export default function SettingsProfileLayout({ children }: SettingsProfileLayoutProps) {
  return (
    <div className="container max-w-4xl py-8 space-y-1">
      <div className="pb-4">
        <h1 className="text-xl font-semibold tracking-tight">Impostazioni profilo</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestisci le informazioni del tuo account e le preferenze personali.
        </p>
      </div>
      <SettingsNav />
      <div className="pt-4 pb-10">{children}</div>
    </div>
  );
}