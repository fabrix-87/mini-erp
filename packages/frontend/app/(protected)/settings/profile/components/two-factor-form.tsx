// packages/frontend/app/(protected)/settings/profile/components/two-factor-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { confirmTwoFactorSchema, disableTwoFactorSchema } from "@mini-erp/shared/validators";
import type {
  ConfirmTwoFactorInput,
  DisableTwoFactorInput,
  TwoFactorSetupResult,
} from "@mini-erp/shared/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { confirmTwoFactorAction, disableTwoFactorAction, enableTwoFactorAction } from "@/actions/settings/toggle-two-factor-actions";

interface TwoFactorFormProps {
  twoFactorEnabled: boolean;
}

/**
 * 2FA management section.
 * Handles enable flow (QR code + TOTP confirm) and disable flow (password + code).
 */
export function TwoFactorForm({ twoFactorEnabled }: TwoFactorFormProps) {
  const [isPending, startTransition] = useTransition();
  const [setupData, setSetupData] = useState<TwoFactorSetupResult | null>(null);
  const [showDisable, setShowDisable] = useState(false);

  const confirmForm = useForm<ConfirmTwoFactorInput>({
    resolver: zodResolver(confirmTwoFactorSchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<DisableTwoFactorInput>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: { password: "", code: "" },
  });

  function handleEnable() {
    startTransition(async () => {
      const result = await enableTwoFactorAction();
      if (result.success && result.data) {
        setSetupData(result.data);
      } else {
        toast.error(result.error ?? "Impossibile avviare la configurazione 2FA.");
      }
    });
  }

  function onConfirm(values: ConfirmTwoFactorInput) {
    startTransition(async () => {
      const result = await confirmTwoFactorAction(values);
      if (result.success) {
        toast.success("Autenticazione a due fattori attivata.");
        setSetupData(null);
      } else {
        toast.error(result.error ?? "Codice non valido.");
      }
    });
  }

  function onDisable(values: DisableTwoFactorInput) {
    startTransition(async () => {
      const result = await disableTwoFactorAction(values);
      if (result.success) {
        toast.success("Autenticazione a due fattori disattivata.");
        setShowDisable(false);
        disableForm.reset();
      } else {
        toast.error(result.error ?? "Operazione non riuscita.");
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Autenticazione a due fattori</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aggiungi un livello extra di sicurezza al tuo account.
          </p>
        </div>
        <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
          {twoFactorEnabled ? "Attiva" : "Non attiva"}
        </Badge>
      </div>

      {/* Enable flow */}
      {!twoFactorEnabled && !setupData && (
        <Button variant="outline" onClick={handleEnable} disabled={isPending}>
          Attiva 2FA
        </Button>
      )}

      {!twoFactorEnabled && setupData && (
        <div className="space-y-4 max-w-sm">
          <p className="text-sm text-muted-foreground">
            Scansiona il QR code con la tua app authenticator (es. Google Authenticator, Authy), poi
            inserisci il codice generato.
          </p>
          {/* Il QR code viene renderizzato dal backend come data-URL o URI */}
          <img src={setupData.qrCode} alt="QR code 2FA" className="w-40 h-40 border rounded-md" />
          <Form {...confirmForm}>
            <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="flex gap-2">
              <FormField
                control={confirmForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Codice TOTP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456" maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                Conferma
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Disable flow */}
      {twoFactorEnabled && !showDisable && (
        <Button variant="destructive" onClick={() => setShowDisable(true)}>
          Disattiva 2FA
        </Button>
      )}

      {twoFactorEnabled && showDisable && (
        <Form {...disableForm}>
          <form onSubmit={disableForm.handleSubmit(onDisable)} className="space-y-3 max-w-sm">
            <FormField
              control={disableForm.control}
              name="password"
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
              control={disableForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice TOTP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123456" maxLength={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={isPending}>
                Conferma disattivazione
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowDisable(false);
                  disableForm.reset();
                }}
              >
                Annulla
              </Button>
            </div>
          </form>
        </Form>
      )}
    </section>
  );
}
