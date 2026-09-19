// packages/frontend/app/(public)/login/components/login-form.tsx
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
import { useTranslations } from "next-intl";

interface SubmitButtonProps {
  isValid: boolean;
  isPending: boolean;
}

/**
 * Renders the login form submission button.
 *
 * @param props - Form validity and pending-state flags.
 * @returns Authentication form submit control.
 */
function SubmitButton({ isValid, isPending }: SubmitButtonProps): React.JSX.Element {
  const t = useTranslations('common.auth')
  return (
    <Button type="submit" className="h-10 w-full font-medium" disabled={isPending || !isValid}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {t('logging')}
        </>
      ) : (
        t('login')
      )}
    </Button>
  );
}

// ============================================================================
// Login Form Component
// ============================================================================
interface LoginFormProps {
  /** URL a cui tornare dopo il login riuscito. Fallback: /dashboard */
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [state, formAction] = useActionState(loginAction, null);
  const { fingerprint } = useFingerprint();

  const t = useTranslations('common.auth')

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
      toast.error(t('loginError'), { description: state.error });
      setError("root", { type: "manual", message: state.error });
    }
  }, [state, setError]);

  // ========================================
  // Redirect su successo
  // ========================================
  useEffect(() => {
    if (state?.success) {
      //router.refresh();
      toast.success(t('loginSuccess'));
      // Sanity check: accetta solo path interni (no redirect aperti)
      const destination = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
      window.location.href = destination;
    }
  }, [state]);

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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{state?.error || errors.root?.message}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          autoComplete="email"
          className={cn(
            "h-10",
            errors.email &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t('password')}</Label>
          <a
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Funzionalità in arrivo");
            }}
          >
            {t('forgotPassword')}
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('passwordPlaceholder')}
            autoComplete="current-password"
            className={cn(
              "h-10 pr-11",
              errors.password &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            )}
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
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
