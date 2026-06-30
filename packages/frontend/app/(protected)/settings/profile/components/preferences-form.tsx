// packages/frontend/app/(protected)/settings/profile/components/preferences-form.tsx
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { UserSettingValueMap } from '@mini-erp/shared/constants';
import { USER_SETTING_KEYS } from '@mini-erp/shared/constants';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { upsertSettingsAction } from '@/actions/settings/update-setting-actions';

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
  const { register, handleSubmit, watch, setValue } = useForm<UserSettingValueMap>({
    defaultValues: settings,
  });

  function onSubmit(values: UserSettingValueMap) {
    startTransition(async () => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      const result = await upsertSettingsAction({ settings: settingsArray });
      if (result.success) {
        toast.success('Preferenze salvate.');
      } else {
        toast.error(result.error ?? 'Errore nel salvataggio.');
      }
    });
  }

  const K = USER_SETTING_KEYS;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* UI */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Interfaccia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tema</Label>
            <Select
              value={watch(K.UI_THEME)}
              onValueChange={(v) => setValue(K.UI_THEME, v as UserSettingValueMap['ui.theme'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="light">Chiaro</SelectItem>
                <SelectItem value="dark">Scuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Densità</Label>
            <Select
              value={watch(K.UI_DENSITY)}
              onValueChange={(v) => setValue(K.UI_DENSITY, v as UserSettingValueMap['ui.density'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compatta</SelectItem>
                <SelectItem value="comfortable">Normale</SelectItem>
                <SelectItem value="spacious">Spaziosa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Locale */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Localizzazione</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Formato data</Label>
            <Select
              value={watch(K.LOCALE_DATE_FORMAT)}
              onValueChange={(v) => setValue(K.LOCALE_DATE_FORMAT, v as UserSettingValueMap['locale.date_format'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Formato ora</Label>
            <Select
              value={watch(K.LOCALE_TIME_FORMAT)}
              onValueChange={(v) => setValue(K.LOCALE_TIME_FORMAT, v as UserSettingValueMap['locale.time_format'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 ore</SelectItem>
                <SelectItem value="12h">12 ore (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Formato numeri</Label>
            <Select
              value={watch(K.LOCALE_NUMBER_FORMAT)}
              onValueChange={(v) => setValue(K.LOCALE_NUMBER_FORMAT, v as UserSettingValueMap['locale.number_format'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EU">Europeo (1.234,56)</SelectItem>
                <SelectItem value="US">Americano (1,234.56)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Notifiche */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Notifiche</h2>
        <div className="space-y-3">
          {[
            { key: K.NOTIFICATIONS_EMAIL, label: 'Notifiche via email' },
            { key: K.NOTIFICATIONS_BROWSER, label: 'Notifiche browser' },
            { key: K.NOTIFICATIONS_ACTIVITY_REMINDER, label: 'Promemoria attività' },
            { key: K.NOTIFICATIONS_NEW_LEAD, label: 'Nuovo lead assegnato' },
            { key: K.NOTIFICATIONS_DOCUMENT, label: 'Aggiornamenti documenti' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="font-normal cursor-pointer">{label}</Label>
              <Switch
                id={key}
                checked={watch(key as keyof UserSettingValueMap) === 'true'}
                onCheckedChange={(checked) =>
                  setValue(key as keyof UserSettingValueMap, checked ? 'true' : 'false' as never)
                }
              />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Dashboard */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Layout widget</Label>
            <Select
              value={watch(K.DASHBOARD_LAYOUT)}
              onValueChange={(v) => setValue(K.DASHBOARD_LAYOUT, v as UserSettingValueMap['dashboard.layout'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Griglia</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Periodo di default</Label>
            <Select
              value={watch(K.DASHBOARD_DEFAULT_PERIOD)}
              onValueChange={(v) => setValue(K.DASHBOARD_DEFAULT_PERIOD, v as UserSettingValueMap['dashboard.default_period'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Settimana</SelectItem>
                <SelectItem value="month">Mese</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Anno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvataggio...' : 'Salva preferenze'}
        </Button>
      </div>
    </form>
  );
}