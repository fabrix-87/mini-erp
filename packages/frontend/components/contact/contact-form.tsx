"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useContactMutations, useContactValidation } from "@/hooks/use-contact";
import type {
  ContactFormProps,
  CreateContactInput,
  UpdateContactInput,
} from "@/types/contact-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyCard from "./contact-form/company-card";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { CreateContactForm, createContactSchema } from "@mini-erp/shared";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { displayFormErrors } from "@/helpers/form-helper";

export default function ContactForm({ isNew, contact }: ContactFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { id: contactId } = contact || { id: undefined };

  // Hooks
  const { createContact, updateContact, isPending } = useContactMutations();
  const { validateEmailUnique, isValidating } = useContactValidation();

  const form = useForm<CreateContactForm>({
    resolver: standardSchemaResolver(createContactSchema),
    defaultValues: contact || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mobilePhone: "",
      active: true,
      notes: "",
      companies: [],
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(
    async (data) => {
       if (isNew) {
        const newContact = await createContact(data as CreateContactInput);
        router.push(`/contacts/${newContact?.id}`);
      } else if (contactId) {
        await updateContact(contactId, data as UpdateContactInput);
        router.push(`/contacts/${contactId}`);
      }
    },
    (errors) => {
      // Questo callback viene chiamato quando la validazione fallisce
      console.log(errors);
      displayFormErrors(errors);
    },
  );

  const {
    control,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
    register,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "companies",
  });

  // Handler da passare al campo email
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const email = e.target.value;

    // Prima fa scattare la validazione Zod (formato)
    const isFormatValid = await trigger("email");
    if (!isFormatValid || !email) return;

    // Poi valida l'unicità
    const isUnique = await validateEmailUnique(email, isNew ? undefined : contactId || undefined);

    if (!isUnique) {
      setError("email", {
        type: "manual",
        message: "Email già esistente",
      });
    } else {
      clearErrors("email");
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    if (confirm("Vuoi annullare le modifiche?")) {
      if (isNew) {
        router.push("/contacts");
      } else {
        router.push(`/contacts/${contactId}`);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>
        <h1 className="text-3xl font-bold">{isNew ? "Nuovo Contatto" : "Modifica Contatto"}</h1>
        <p className="text-muted-foreground">
          {isNew ? "Inserisci i dati del nuovo contatto" : "Aggiorna le informazioni del contatto"}
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Azienda */}
          <CompanyCard
            selectedCompanies={fields}
            onAddCompany={(companyId) =>
              append({
                companyId,
                position: null,
                department: null,
                isPrimaryContact: fields.length === 0,
              })
            }
            onRemoveCompany={(index) => remove(index)}
            error={errors.companies?.root?.message ?? (errors.companies as any)?.message}
          />

          {/* Dati Personali */}
          <Card>
            <CardHeader>
              <CardTitle>Dati Personali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* firstName */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Mario"
                    aria-invalid={!!errors.firstName}
                    className={errors.firstName ? "border-red-500" : ""}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                {/* lastName */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    placeholder="Rossi"
                    aria-invalid={!!errors.lastName}
                    className={errors.lastName ? "border-red-500" : ""}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        placeholder="mario.rossi@example.com"
                        aria-invalid={!!errors.email}
                        className={errors.email ? "border-red-500" : ""}
                        {...field}
                        value={field.value ?? ""}
                        onBlur={async (e) => {
                          field.onBlur();
                          await handleEmailBlur(e);
                        }}
                      />
                    )}
                  />
                  {isValidating && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+39 02 1234567"
                    {...register("phone")}
                  />
                </div>

                {/* mobilePhone */}
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Cellulare</Label>
                  <Input
                    id="mobilePhone"
                    type="tel"
                    placeholder="+39 333 1234567"
                    {...register("mobilePhone")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impostazioni */}
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Attivo</Label>
                  <p className="text-sm text-gray-500">
                    Il contatto può essere utilizzato nel sistema
                  </p>
                </div>
                <Controller
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardHeader>
              <CardTitle>Note</CardTitle>
              <CardDescription>Aggiungi informazioni aggiuntive sul contatto</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder="Inserisci note..."
                rows={4}
                {...register("notes")}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending || isLoading}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPending ? "Salvataggio..." : isNew ? "Crea Contatto" : "Salva Modifiche"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
