// app/(protected)/layout.tsx
import { CrmLayout } from "@/components/crm-layout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <CrmLayout>{children}</CrmLayout>;
}