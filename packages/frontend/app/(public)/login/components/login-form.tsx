"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { toast } from "sonner";
import { useFingerprint } from "@/hooks/use-fingerprint";
import { LoginInput, loginSchema } from "@mini-erp/shared";
import { useRouter } from "next/navigation";

// ============================================================================
// Submit Button Component
// ============================================================================
function SubmitButton({ isValid, isPending }: { isValid: boolean; isPending: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/30 transition-all"
      disabled={isPending || !isValid}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Accesso in corso...
        </>
      ) : (
        "Accedi"
      )}
    </Button>
  );
}

// ============================================================================
// Login Form Component
// ============================================================================
export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [state, formAction] = useActionState(loginAction, null);
  const { fingerprint } = useFingerprint();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  // ========================================
  // Gestione errori dalla Server Action
  // ========================================
  useEffect(() => {
    if (state?.error) {
      toast.error("Login fallito", { description: state.error });
      setError("root", { type: "manual", message: state.error });
    }
  }, [state, setError]);

  // ========================================
  // Redirect su successo
  // ========================================
  useEffect(() => {
    if (state?.success) {
      router.refresh();
      toast.success("Accesso eseguito");
      window.location.href = "/dashboard";
    }
  }, [state, router]);

  // ========================================
  // Submit: valida con zod poi invia come FormData
  // ========================================
  const onSubmit = (data: LoginInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (fingerprint) formData.append("fingerprint", fingerprint);

    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {(state?.error || errors.root) && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {state?.error || errors.root?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nome@esempio.com"
          autoComplete="email"
          className={cn(
            "h-11 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500",
            errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500",
          )}
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="text-sm font-medium text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-700 font-medium">
            Password
          </Label>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Funzionalità in arrivo");
            }}
          >
            Password dimenticata?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Inserisci la tua password"
            autoComplete="current-password"
            className={cn(
              "h-11 pr-11 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500",
              errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm font-medium text-red-600">{errors.password.message}</p>
        )}
      </div>

      <SubmitButton isValid={isValid} isPending={isPending} />
    </form>
  );
}
