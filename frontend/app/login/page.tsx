"use client";

import { LoginForm } from "@/components/LoginForm";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/api/modules/auth";
import { toast } from "sonner";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Usa il hook React Query
  const loginMutation = useLogin();

  const onSubmit = async (data: { email: string; password: string }) => {
    console.log("🔵 onSubmit chiamato con:", data);
    setError(null);

    try {
      await loginMutation.mutateAsync(data);
      toast.success("Accesso effettuato con successo!");
      // IMPORTANTE: Redirect dopo login riuscito
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("🔴 Login error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Errore durante il login. Riprova.";

      setError(errorMessage);
      return;
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <LoginForm onSubmit={onSubmit} error={error} isLoading={loginMutation.isPending}  className="relative z-10" />
    </div>
  );
}
