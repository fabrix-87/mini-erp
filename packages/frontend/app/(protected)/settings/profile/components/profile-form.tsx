// packages/frontend/app/(protected)/settings/profile/components/profile-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import type { User } from '@mini-erp/shared/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Gender, ProfileFormInput, profileFormSchema, ProfileFormValues } from '@mini-erp/shared';
import { updateProfileAction } from '@/actions/settings/update-profile-actions';

interface ProfileFormProps {
  user: User;
}

/**
 * Form for editing the current user's profile (UserDetails + username).
 * Uses react-hook-form with Zod validation from @mini-erp/shared.
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const d = user.details;

  const form = useForm<ProfileFormValues, any, ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      firstName: d?.firstName ?? '',
      lastName: d?.lastName ?? '',
      bio: d?.bio ?? '',
      phone: d?.phone ?? '',
      address: d?.address ?? '',
      city: d?.city ?? '',
      state: d?.state ?? '',
      zipCode: d?.zipCode ?? '',
      countryCode: d?.countryCode ?? '',
      gender: d?.gender ?? Gender.PREFER_NOT_TO_SAY,
      dateOfBirth: d?.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split('T')[0] : '',    
      preferredLanguageId: user.preferredLanguageId,
    },
  });

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.success) {
        toast.success('Profilo aggiornato con successo.');
      } else {
        toast.error(result.error ?? 'Errore durante il salvataggio.');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Account */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={user.email} disabled readOnly />
              <p className="text-xs text-muted-foreground mt-1">
                Per cambiare email contatta l'amministratore.
              </p>
            </FormItem>
          </div>
        </section>

        <Separator />

        {/* Dati personali */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Dati personali</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genere</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Uomo</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Donna</SelectItem>
                      <SelectItem value={Gender.OTHER}>Altro</SelectItem>
                      <SelectItem value={Gender.PREFER_NOT_TO_SAY}>
                        Preferisco non specificare
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    rows={3}
                    placeholder="Descrivi brevemente il tuo ruolo..."
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* Indirizzo */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Indirizzo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAP</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia / Regione</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paese (codice ISO)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="IT" maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      </form>
    </Form>
  );
}