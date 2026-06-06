// app/template.tsx
"use client";

import { usePathname } from "next/navigation";
import { CrmLayout } from "@/components/crm-layout";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/login";

  if (isPublicPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return <CrmLayout>{children}</CrmLayout>;
}
