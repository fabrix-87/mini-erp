"use client";

import { useMemo, useState } from "react";
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
import { useRef } from "react";
import {
  createCompanyContactAction,
  updateCompanyContactAction,
  deleteCompanyContactAction,
} from "@/actions/company-contact-actions";
import type { CompanyContactSummary } from "@mini-erp/shared";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import { useActionLabels, useCrumbMap } from "@/hooks/use-breadcrumb";
import { useNavigation } from "@/hooks/use-navigation";
import { toast } from "sonner";

export default function ContactForm({ isNew, contact }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const actionLabels = useActionLabels();
  const crumbs = useCrumbMap();
  const { navigateToDetail, navigate } = useNavigation();

  const { id: contactId } = contact || { id: undefined };

  /**
   * Pre-populated name map built from the contact's already-loaded company
   * associations. Prevents "Company #id" flash while the search fetch completes.
   */
  const initialCompanyNameMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        (contact?.companies ?? []).map((c) => [c.companyId.toString(), c.company.companyName]),
      ),
    // Stable reference: contact viene dal server e non cambia durante il ciclo di vita
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Snapshot of the original company associations loaded from the API.
   * Used in edit mode to compute the diff at submit time.
   */
  const originalCompaniesRef = useRef<CompanyContactSummary[]>(contact?.companies ?? []);

  /**
   * Computes and applies the diff between original and submitted company
   * associations. Runs only in edit mode.
   *
   * - New entries (not in original)  → createCompanyContactAction
   * - Removed entries (not in form)  → deleteCompanyContactAction
   * - Changed entries (same companyId, different fields) → updateCompanyContactAction
   *
   * @param contactId - The contact being edited
   * @param submitted - Company entries from the submitted form
   */
  const syncCompanies = async (contactId: string, submitted: CreateContactForm["companies"]) => {
    const original = originalCompaniesRef.current;

    const originalMap = new Map(original.map((c) => [c.companyId, c]));
    const submittedMap = new Map(submitted.map((c) => [c.companyId, c]));

    const promises: Promise<unknown>[] = [];

    // ── Aggiunte: presenti nel form ma non nell'originale ──────────────────────
    for (const entry of submitted) {
      const id = entry.companyId;
      if (!originalMap.has(id)) {
        promises.push(
          createCompanyContactAction({
            contactId,
            companyId: id,
            position: entry.position ?? null,
            department: entry.department ?? null,
            isPrimaryContact: entry.isPrimaryContact ?? false,
          }),
        );
      }
    }

    // ── Rimosse: presenti nell'originale ma non nel form ──────────────────────
    for (const orig of original) {
      if (!submittedMap.has(orig.companyId)) {
        promises.push(deleteCompanyContactAction(contactId, orig.companyId));
      }
    }

    // ── Modificate: presenti in entrambi ma con campi diversi ─────────────────
    for (const entry of submitted) {
      const id = entry.companyId;
      const orig = originalMap.get(id);
      if (!orig) continue; // è un'aggiunta, già gestita sopra

      const positionChanged = (entry.position ?? null) !== orig.position;
      const departmentChanged = (entry.department ?? null) !== orig.department;
      const primaryChanged = (entry.isPrimaryContact ?? false) !== orig.isPrimaryContact;

      if (positionChanged || departmentChanged || primaryChanged) {
        promises.push(
          updateCompanyContactAction(contactId, id, {
            position: entry.position ?? null,
            department: entry.department ?? null,
            isPrimaryContact: entry.isPrimaryContact ?? false,
          }),
        );
      }
    }

    await Promise.all(promises);
  };

  // Hooks
  const { createContact, updateContact, isPending } = useContactMutations();
  const { validateEmailUnique, isValidating } = useContactValidation();

  const form = useForm<CreateContactForm>({
    resolver: standardSchemaResolver(createContactSchema),
    defaultValues: contact
      ? {
          firstName: contact.firstName,
          lastName: contact.lastName ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          mobilePhone: contact.mobilePhone ?? "",
          active: contact.active,
          notes: contact.notes ?? "",
          // Mappa CompanyContactSummary → contactCompanyEntrySchema
          companies: contact.companies.map((c) => ({
            companyId: c.companyId,
            position: c.position ?? null,
            department: c.department ?? null,
            isPrimaryContact: c.isPrimaryContact,
          })),
        }
      : {
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
        // In create mode le company vengono salvate insieme al contatto
        const newContact = await createContact(data as CreateContactInput);
        if (newContact) navigateToDetail("contacts", newContact.id);
        else toast.error("Impossibile creare il contatto");
      } else if (contactId) {
        // 1. Salva i campi anagrafici del contatto (senza companies —
        //    updateContactSchema non include companies)
        const { companies, ...contactFields } = data;
        await updateContact(contactId, contactFields as UpdateContactInput);

        // 2. Sincronizza le company associations tramite le dedicate action
        await syncCompanies(contactId, companies);

        navigateToDetail("contacts", contactId);
      }
    },
    (errors) => {
      console.error(errors);
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

  const { fields, append, remove, update } = useFieldArray({
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
    const isUnique = await validateEmailUnique(email, isNew ? undefined : contactId);

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
        navigate("contacts");
      } else {
        navigateToDetail("contacts", contactId!);
      }
    }
  };

  /**
   * Sets isPrimaryContact=true for the given index and
   * clears the flag on all other company entries.
   * If the entry is already primary, deselects it (toggle off).
   */
  const handleSetPrimary = (index: number) => {
    const current = fields[index];
    const willBePrimary = !current.isPrimaryContact;

    fields.forEach((field, i) => {
      update(i, {
        ...field,
        isPrimaryContact: i === index ? willBePrimary : false,
      });
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Setter breadcrumb - Solo in modifica*/}
      {contact && (
        <BreadcrumbSetter
          items={[
            crumbs.contacts,
            { label: `${actionLabels.edit}: ${contact.firstName} ${contact.lastName}` },
          ]}
        />
      )}
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => (isNew ? navigate("contacts") : navigateToDetail("contacts", contactId!))}
          className="mb-4"
        >
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
                isPrimaryContact: false,
              })
            }
            onRemoveCompany={(index) => remove(index)}
            onSetPrimary={handleSetPrimary}
            initialNameMap={initialCompanyNameMap}
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
