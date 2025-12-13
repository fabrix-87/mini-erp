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
import { Checkbox } from "@/components/ui/checkbox";

// Schema di validazione
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida"),
  password: z
    .string()
    .min(1, "La password è obbligatoria")
    .min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  defaultValues?: Partial<LoginFormData>;
  error?: string | null;
  isLoading: boolean;
}

export function LoginForm({ className, onSubmit, defaultValues, error, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues,
  });

  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* Logo/Brand Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bentornato</h1>
        <p className="text-slate-600">Accedi al tuo account per continuare</p>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
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
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
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
                  errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
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

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm text-slate-600 cursor-pointer select-none"
            >
              Ricordami
            </label>
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
      </div>

      {/* Footer 
      
      <p className="text-center text-sm text-slate-600 mt-6">
        Non hai un account?{" "}
        <a
          href="#"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          onClick={(e) => {
            e.preventDefault();
            console.log("Vai a registrazione");
          }}
        >
          Registrati
        </a>
      </p>
      */}
    </div>

  );
}