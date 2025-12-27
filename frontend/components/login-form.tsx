"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/services/auth";
import { toast } from "sonner";
import { useFingerprint } from "@/hooks/use-fingerprint";

// Schema di validazione
const loginSchema = z.object({
  email: z.email("Inserisci un'email valida"),
  password: z
    .string()
    .min(1, "La password è obbligatoria")
    .min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const { fingerprint, isLoading: fpLoading } = useFingerprint();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Login con fingerprint automatico
      await login(data);

      // Aggiorna user context
      await refreshUser();

      toast.success("Login effettuato con successo", {
        description: "Benvenuto!",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Credenziali non valide");
      toast.error("Login fallito", {
        description: error.message || "Credenziali non valide",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (fpLoading) {
    return (
      <div className="loading">
        <p>Initializing device security...</p>
      </div>
    );
  }

  return (
    <div onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
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
            errors.email &&
              "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm font-medium text-red-600">
            {errors.email.message}
          </p>
        )}
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
              console.log("Password dimenticata");
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
              errors.password &&
                "border-red-500 focus:border-red-500 focus:ring-red-500"
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
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm font-medium text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        onClick={handleSubmit(onSubmit)}
        className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/30 transition-all"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Accesso in corso...
          </>
        ) : (
          "Accedi"
        )}
      </Button>
    </div>
  );
}
