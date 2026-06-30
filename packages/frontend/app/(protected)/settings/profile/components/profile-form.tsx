// packages/frontend/app/(protected)/settings/profile/components/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import type { User } from "@mini-erp/shared/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Gender,
  type ProfileFormInput,
  profileFormSchema,
  type ProfileFormValues,
} from "@mini-erp/shared";
import { updateProfileAction } from "@/actions/settings/update-profile-actions";
import { IconUser, IconId, IconMapPin, IconLock } from "@tabler/icons-react";

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

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      firstName: d?.firstName ?? "",
      lastName: d?.lastName ?? "",
      bio: d?.bio ?? "",
      phone: d?.phone ?? "",
      address: d?.address ?? "",
      city: d?.city ?? "",
      state: d?.state ?? "",
      zipCode: d?.zipCode ?? "",
      countryCode: d?.countryCode ?? "",
      gender: d?.gender ?? "PREFER_NOT_TO_SAY",
      dateOfBirth: d?.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split("T")[0] : "",
      preferredLanguageId: user.preferredLanguageId,
    },
  });

  function onSubmit(values: ProfileFormValues): void {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.success) {
        toast.success("Profilo aggiornato con successo.");
      } else {
        toast.error(result.error ?? "Errore durante il salvataggio.");
      }
    });
  }

  /** Derives initials from the user's name or falls back to email. */
  const initials =
    [d?.firstName, d?.lastName]
      .filter(Boolean)
      .map((n) => n![0].toUpperCase())
      .join("") || user.email[0].toUpperCase();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Account */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <IconUser size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Account</h2>
          </div>
          <Separator />

          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-lg select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {d?.firstName && d?.lastName ? `${d.firstName} ${d.lastName}` : user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">&nbsp;</p>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                Email
                <IconLock size={11} className="text-muted-foreground/60" />
              </FormLabel>
              <Input value={user.email} disabled readOnly />
              <p className="text-xs text-muted-foreground mt-1">
                Per cambiare email contatta l&apos;amministratore.
              </p>
            </FormItem>
          </div>
        </div>

        {/* Dati personali */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <IconId size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Dati personali</h2>
          </div>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Cognome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Telefono</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Data di nascita</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Genere</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
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
                <FormLabel className="text-xs text-muted-foreground">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                    placeholder="Descrivi brevemente il tuo ruolo..."
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Indirizzo */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <IconMapPin size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Indirizzo</h2>
          </div>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {/* Via — full width */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-6">
                  <FormLabel className="text-xs text-muted-foreground">Via / Indirizzo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Città — 3 col */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel className="text-xs text-muted-foreground">Città</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* CAP — 1 col */}
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel className="text-xs text-muted-foreground">CAP</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Provincia — 2 col */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs text-muted-foreground">
                    Provincia / Regione
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Paese ISO — 2 col */}
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs text-muted-foreground">Paese (ISO)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="IT"
                      maxLength={2}
                      className="uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
