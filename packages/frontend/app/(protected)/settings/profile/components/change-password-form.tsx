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
import { Separator } from "@/components/ui/separator";
import { updatePasswordAction } from "@/actions/settings/update-password-actions";
import { IconLock } from "@tabler/icons-react";

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

  function onSubmit(values: ChangePasswordInput): void {
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
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <IconLock size={16} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold">Cambia password</h2>
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">
        Usa una password lunga almeno 8 caratteri con lettere, numeri e simboli.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-w-sm">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Password attuale</FormLabel>
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
                <FormLabel className="text-xs text-muted-foreground">Nuova password</FormLabel>
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
                <FormLabel className="text-xs text-muted-foreground">Conferma nuova password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Aggiornamento..." : "Aggiorna password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}