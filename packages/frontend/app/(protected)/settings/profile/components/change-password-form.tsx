// packages/frontend/app/(protected)/settings/profile/components/change-password-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { changePasswordSchema } from "@mini-erp/shared/validators";
import type { ChangePasswordInput } from "@mini-erp/shared/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePasswordAction } from "@/actions/settings/update-password-actions";

/**
 * Form for changing the current user's password.
 * Validates with Zod schema from @mini-erp/shared.
 */
export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await updatePasswordAction(values);
      if (result.success) {
        toast.success("Password aggiornata con successo.");
        form.reset();
      } else {
        toast.error(result.error ?? "Errore durante il cambio password.");
      }
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Cambia password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Usa una password lunga almeno 8 caratteri con lettere, numeri e simboli.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password attuale</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuova password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conferma nuova password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Aggiornamento..." : "Aggiorna password"}
          </Button>
        </form>
      </Form>
    </section>
  );
}
