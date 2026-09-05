"use client";

import { memo } from "react";
import type { LucideProps } from "lucide-react";
import { iconRegistry, type AppIconName } from "@/config/icons";

export interface AppIconProps extends LucideProps {
  /** Nome icona dal registry. Validato a compile time. */
  name: AppIconName;
}

/**
 * Renders a registered Lucide icon by name.
 * Icons are statically imported — no lazy loading, no Suspense, no runtime overhead.
 * To add an icon, register it in `config/icons.ts`.
 */
export const AppIcon = memo(function AppIcon({ name, ...props }: AppIconProps) {
  const Icon = iconRegistry[name];
  return <Icon {...props} />;
});
