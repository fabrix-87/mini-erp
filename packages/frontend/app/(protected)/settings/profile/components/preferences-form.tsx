// packages/frontend/app/(protected)/settings/profile/components/preferences-form.tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { UserSettingValueMap } from "@mini-erp/shared/constants";
import { USER_SETTING_KEYS } from "@mini-erp/shared/constants";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertSettingsAction } from "@/actions/settings/update-setting-actions";
import type { PathValue } from "react-hook-form";
import { IconPalette, IconWorld, IconBell, IconLayoutDashboard } from "@tabler/icons-react";

interface PreferencesFormProps {
  settings: UserSettingValueMap;
}

/**
 * Form for editing all known UserSettings.
 * Groups settings by category (UI, Locale, Notifications, Dashboard).
 * Submits a bulk upsert via upsertSettingsAction.
 */
export function PreferencesForm({ settings }: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition();
  const { handleSubmit, watch, setValue } = useForm<UserSettingValueMap>({
    defaultValues: settings,
  });

  /**
   * Type-safe wrapper around setValue to avoid the `never` inference issue
   * that arises when TypeScript cannot narrow the value type for a given key.
   */
  function setField<K extends keyof UserSettingValueMap>(
    key: K,
    value: PathValue<UserSettingValueMap, K>,
  ): void {
    setValue(key, value);
  }

  function onSubmit(values: UserSettingValueMap): void {
    startTransition(async () => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      const result = await upsertSettingsAction({ settings: settingsArray });
      if (result.success) {
        toast.success("Preferenze salvate.");
      } else {
        toast.error(result.error ?? "Errore nel salvataggio.");
      }
    });
  }

  const K = USER_SETTING_KEYS;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Interfaccia */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IconPalette size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Interfaccia</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tema</Label>
            <Select
              value={watch(K.UI_THEME)}
              onValueChange={(v) =>
                setField(K.UI_THEME, v as PathValue<UserSettingValueMap, typeof K.UI_THEME>)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="light">Chiaro</SelectItem>
                <SelectItem value="dark">Scuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Densità</Label>
            <Select
              value={watch(K.UI_DENSITY)}
              onValueChange={(v) =>
                setField(K.UI_DENSITY, v as PathValue<UserSettingValueMap, typeof K.UI_DENSITY>)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compatta</SelectItem>
                <SelectItem value="comfortable">Normale</SelectItem>
                <SelectItem value="spacious">Spaziosa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Localizzazione */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IconWorld size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Localizzazione</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Formato data</Label>
            <Select
              value={watch(K.LOCALE_DATE_FORMAT)}
              onValueChange={(v) =>
                setField(
                  K.LOCALE_DATE_FORMAT,
                  v as PathValue<UserSettingValueMap, typeof K.LOCALE_DATE_FORMAT>,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Formato ora</Label>
            <Select
              value={watch(K.LOCALE_TIME_FORMAT)}
              onValueChange={(v) =>
                setField(
                  K.LOCALE_TIME_FORMAT,
                  v as PathValue<UserSettingValueMap, typeof K.LOCALE_TIME_FORMAT>,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 ore</SelectItem>
                <SelectItem value="12h">12 ore (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Formato numeri</Label>
            <Select
              value={watch(K.LOCALE_NUMBER_FORMAT)}
              onValueChange={(v) =>
                setField(
                  K.LOCALE_NUMBER_FORMAT,
                  v as PathValue<UserSettingValueMap, typeof K.LOCALE_NUMBER_FORMAT>,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EU">Europeo (1.234,56)</SelectItem>
                <SelectItem value="US">Americano (1,234.56)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notifiche */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IconBell size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifiche</h2>
        </div>
        <Separator />
        <div className="divide-y divide-border">
          {(
            [
              {
                key: K.NOTIFICATIONS_EMAIL,
                label: "Notifiche via email",
                description: "Ricevi aggiornamenti via email",
              },
              {
                key: K.NOTIFICATIONS_BROWSER,
                label: "Notifiche browser",
                description: "Notifiche push nel browser",
              },
              {
                key: K.NOTIFICATIONS_ACTIVITY_REMINDER,
                label: "Promemoria attività",
                description: "Ricordati delle attività in scadenza",
              },
              {
                key: K.NOTIFICATIONS_NEW_LEAD,
                label: "Nuovo lead assegnato",
                description: "Avviso quando ti viene assegnato un lead",
              },
              {
                key: K.NOTIFICATIONS_DOCUMENT,
                label: "Aggiornamenti documenti",
                description: "Modifiche ai documenti condivisi",
              },
            ] as const
          ).map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <Label htmlFor={key} className="text-sm font-normal cursor-pointer leading-none">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={key}
                checked={watch(key) === "true"}
                onCheckedChange={(checked) =>
                  setField(
                    key,
                    (checked ? "true" : "false") as PathValue<UserSettingValueMap, typeof key>,
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IconLayoutDashboard size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Dashboard</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Layout widget</Label>
            <Select
              value={watch(K.DASHBOARD_LAYOUT)}
              onValueChange={(v) =>
                setField(
                  K.DASHBOARD_LAYOUT,
                  v as PathValue<UserSettingValueMap, typeof K.DASHBOARD_LAYOUT>,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Griglia</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Periodo di default</Label>
            <Select
              value={watch(K.DASHBOARD_DEFAULT_PERIOD)}
              onValueChange={(v) =>
                setField(
                  K.DASHBOARD_DEFAULT_PERIOD,
                  v as PathValue<UserSettingValueMap, typeof K.DASHBOARD_DEFAULT_PERIOD>,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Settimana</SelectItem>
                <SelectItem value="month">Mese</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Anno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvataggio..." : "Salva preferenze"}
        </Button>
      </div>
    </form>
  );
}
