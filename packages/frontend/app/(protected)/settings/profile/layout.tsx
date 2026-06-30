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
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Impostazioni profilo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestisci le informazioni del tuo account e le preferenze personali.
        </p>
      </div>
      <SettingsNav />
      <div>{children}</div>
    </div>
  );
}
