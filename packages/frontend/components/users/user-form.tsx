// components/users/user-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  CreateUserFormInput,
  UpdateUserFormInput,
  createUserFormSchema,
  updateUserFormSchema,
} from "@/types/user";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createUserAction,
  updateUserProfileAction,
  updateUserDetailsAction,
  updateUserRolesAction,
} from "@/actions/user";
import { Loader2, Save, Shield, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import { CountryCombobox } from "../ui/country-combobox";

// ============================================================================
// Component Props
// ============================================================================

interface UserFormProps {
  user?: User;
  mode: "create" | "edit";
  roles: Array<{ id: number; name: string; code: string }>;
  languages: Array<{ id: number; name: string; iso_code: string }>;
}

// ============================================================================
// Component
// ============================================================================

export function UserForm({ user, mode, roles = [], languages = [] }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"profile" | "details" | "address">("profile");

  const schema = mode === "create" ? createUserFormSchema : updateUserFormSchema;
  type FormValues = CreateUserFormInput | UpdateUserFormInput;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      firstName: user?.details?.firstName || "",
      lastName: user?.details?.lastName || "",
      phone: user?.details?.phone || "",
      address: user?.details?.address || "",
      city: user?.details?.city || "",
      state: user?.details?.state || "",
      zipCode: user?.details?.zipCode || "",
      country: user?.details?.country || "",
      dateOfBirth: user?.details?.dateOfBirth || null,
      gender: user?.details?.gender || undefined,
      bio: user?.details?.bio || "",
      roleIds: user?.roles?.map((r) => r.id) || [],
      preferredLanguageId: user?.preferredLanguageId ?? 1,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        if (mode === "create") {
          const createData = data as CreateUserFormInput;

          // Create new user
          const result = await createUserAction({
            username: createData.username,
            email: createData.email,
            password: createData.password || "",
            roleIds: createData.roleIds,
            preferredLanguageId: createData.preferredLanguageId ?? 1,
            active: true,
            details: {
              firstName: createData.firstName,
              lastName: createData.lastName,
              phone: createData.phone || "",
            },
          });

          if (result.success) {
            toast.success(result.message || "Utente creato con successo");
            router.push("/settings/users");
            router.refresh();
          } else {
            toast.error(result.error || "Errore durante la creazione");
          }
        } else {
          // Update existing user
          const updateData = data as UpdateUserFormInput;
          const userId = user!.id;

          // Update profile if changed
          const profileChanged =
            updateData.username !== updateData!.username || updateData.email !== updateData!.email;

          if (profileChanged) {
            const profileResult = await updateUserProfileAction(userId, {
              username: updateData.username,
              email: updateData.email,
              preferredLanguageId: updateData.preferredLanguageId ?? 1,
            });

            if (!profileResult.success) {
              toast.error(profileResult.error || "Errore aggiornamento profilo");
              return;
            }
          }

          // Update details
          // Update roles if changed
          const currentRoleIds = (data as UpdateUserFormInput).roleIds ?? [];
          const originalRoleIds = user?.roles?.map((r) => r.id) ?? [];
          const rolesChanged =
            JSON.stringify([...currentRoleIds].sort()) !==
            JSON.stringify([...originalRoleIds].sort());

          if (rolesChanged && currentRoleIds.length > 0) {
            const rolesResult = await updateUserRolesAction(userId, currentRoleIds);
            if (!rolesResult.success) {
              toast.error(rolesResult.error || "Errore aggiornamento ruoli");
              return;
            }
          }

          // Update details
          const detailsResult = await updateUserDetailsAction(userId, {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            phone: updateData.phone,
            address: updateData.address,
            city: updateData.city,
            state: updateData.state,
            zipCode: updateData.zipCode,
            country: updateData.country,
            dateOfBirth: updateData.dateOfBirth,
            gender: updateData.gender,
            bio: updateData.bio,
          });

          if (detailsResult.success) {
            toast.success(detailsResult.message || "Utente aggiornato con successo");
            router.push(`/settings/users/${userId}`);
            router.refresh();
          } else {
            toast.error(detailsResult.error || "Errore durante l'aggiornamento");
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Errore imprevisto");
      }
    });
  };

  const handleCancel = () => {
    if (mode === "edit" && user) {
      router.push(`/settings/users/${user.id}`);
    } else {
      router.push("/settings/users");
    }
  };

  return (
    <Form {...form}>
      <BreadcrumbSetter
        title={mode === "edit" ? `Modifica Utente ${user?.username}` : `Crea Utente`}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            type="button"
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className="rounded-b-none"
          >
            Profilo
          </Button>
          <Button
            type="button"
            variant={activeTab === "details" ? "default" : "ghost"}
            onClick={() => setActiveTab("details")}
            className="rounded-b-none"
          >
            Dettagli Personali
          </Button>
          <Button
            type="button"
            variant={activeTab === "address" ? "default" : "ghost"}
            onClick={() => setActiveTab("address")}
            className="rounded-b-none"
          >
            Indirizzo
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Account</CardTitle>
              <CardDescription>Credenziali di accesso e informazioni base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 items-start">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="johndoe" disabled={isPending} />
                      </FormControl>
                      <FormDescription>
                        Minimo 3 caratteri, solo lettere, numeri e underscore
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preferred Language */}
              <FormField
                control={form.control}
                name="preferredLanguageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lingua preferita</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      value={field.value != null ? String(field.value) : ""}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona lingua..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={String(lang.id)}>
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-xs uppercase text-muted-foreground w-6">
                                {lang.iso_code}
                              </span>
                              {lang.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>Minimo 8 caratteri</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {mode === "edit" && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Per cambiare la password, usa la funzione "Reset Password" dalla pagina dettagli
                    utente
                  </p>
                </div>
              )}

              {/* Roles */}
              <FormField
                control={form.control}
                name="roleIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Ruoli
                    </FormLabel>
                    <FormDescription>
                      Seleziona i ruoli da assegnare all&apos;utente
                    </FormDescription>
                    {roles.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Nessun ruolo disponibile
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3 pt-1">
                        {roles.map((role) => {
                          const isChecked = (field.value ?? []).includes(role.id);
                          return (
                            <label
                              key={role.id}
                              className={[
                                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                                isChecked
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border hover:border-primary/50",
                                isPending ? "pointer-events-none opacity-50" : "",
                              ].join(" ")}
                            >
                              <Checkbox
                                checked={isChecked}
                                disabled={isPending}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    checked
                                      ? [...current, role.id]
                                      : current.filter((id) => id !== role.id),
                                  );
                                }}
                              />
                              <span className="font-medium">{role.name}</span>
                              <Badge variant="outline" className="text-xs font-mono">
                                {role.code}
                              </Badge>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Personali</CardTitle>
              <CardDescription>Informazioni anagrafiche e personali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mario" disabled={isPending} />
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
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rossi" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="+39 123 456 7890"
                          disabled={isPending}
                        />
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
                      <FormLabel>Data di Nascita</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split("T")[0]
                              : field.value || ""
                          }
                          type="date"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genere</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona genere" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Uomo</SelectItem>
                        <SelectItem value="FEMALE">Donna</SelectItem>
                        <SelectItem value="OTHER">Altro</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">
                          Preferisco non specificare
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Scrivi qualcosa su di te..."
                        rows={4}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>Massimo 1000 caratteri</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <Card>
            <CardHeader>
              <CardTitle>Indirizzo</CardTitle>
              <CardDescription>Informazioni sulla residenza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Via Roma, 123"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Milano"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia/Stato</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="MI"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="20100"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paese</FormLabel>
                      <FormControl>
                        <CountryCombobox
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
            <X className="h-4 w-4 mr-2" />
            Annulla
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "create" ? "Crea Utente" : "Salva Modifiche"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
