// packages/frontend/app/(protected)/settings/profile/components/two-factor-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { confirmTwoFactorSchema, disableTwoFactorSchema } from "@mini-erp/shared/validators";
import type {
  ConfirmTwoFactorInput,
  DisableTwoFactorInput,
  TwoFactorSetupResult,
} from "@mini-erp/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  confirmTwoFactorAction,
  disableTwoFactorAction,
  enableTwoFactorAction,
} from "@/actions/settings/toggle-two-factor-actions";
import { IconShieldCheck, IconShieldOff, IconShieldLock } from "@tabler/icons-react";

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

  function handleEnable(): void {
    startTransition(async () => {
      const result = await enableTwoFactorAction();
      if (result.success && result.data) {
        setSetupData(result.data);
      } else {
        toast.error(result.error ?? "Impossibile avviare la configurazione 2FA.");
      }
    });
  }

  function onConfirm(values: ConfirmTwoFactorInput): void {
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

  function onDisable(values: DisableTwoFactorInput): void {
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
    <div className="rounded-lg border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconShieldLock size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Autenticazione a due fattori</h2>
        </div>
        <Badge
          variant={twoFactorEnabled ? "default" : "secondary"}
          className="text-xs"
        >
          {twoFactorEnabled ? "Attiva" : "Non attiva"}
        </Badge>
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Aggiungi un livello extra di sicurezza al tuo account richiedendo un codice
        temporaneo oltre alla password.
      </p>

      {/* ── Enable flow: idle ── */}
      {!twoFactorEnabled && !setupData && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnable}
          disabled={isPending}
          className="gap-2"
        >
          <IconShieldCheck size={15} />
          Attiva 2FA
        </Button>
      )}

      {/* ── Enable flow: QR + confirm ── */}
      {!twoFactorEnabled && setupData && (
        <div className="space-y-4">
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Apri la tua app authenticator (Google Authenticator, Authy…)</li>
            <li>Scansiona il QR code qui sotto</li>
            <li>Inserisci il codice a 6 cifre generato dall&apos;app</li>
          </ol>
          <div className="inline-flex rounded-lg border bg-white p-2">
            <Image
              src={setupData.qrCode}
              alt="QR code per la configurazione 2FA"
              width={144}
              height={144}
              unoptimized
            />
          </div>
          <Form {...confirmForm}>
            <form
              onSubmit={confirmForm.handleSubmit(onConfirm)}
              className="flex items-end gap-2 max-w-xs"
            >
              <FormField
                control={confirmForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs text-muted-foreground">
                      Codice TOTP
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="shrink-0">
                Conferma
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* ── Disable flow: idle ── */}
      {twoFactorEnabled && !showDisable && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDisable(true)}
          className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5"
        >
          <IconShieldOff size={15} />
          Disattiva 2FA
        </Button>
      )}

      {/* ── Disable flow: confirm form ── */}
      {twoFactorEnabled && showDisable && (
        <div className="space-y-3 rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs text-muted-foreground">
            Inserisci la tua password attuale e il codice TOTP per disattivare la 2FA.
          </p>
          <Form {...disableForm}>
            <form
              onSubmit={disableForm.handleSubmit(onDisable)}
              className="space-y-3 max-w-xs"
            >
              <FormField
                control={disableForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Password attuale
                    </FormLabel>
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
                    <FormLabel className="text-xs text-muted-foreground">
                      Codice TOTP
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                >
                  Conferma disattivazione
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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
        </div>
      )}
    </div>
  );
}