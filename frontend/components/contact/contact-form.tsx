"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  useContact,
  useContactMutations,
  useContactValidation,
} from "@/hooks/use-contact";
import type { CreateContactInput, UpdateContactInput } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CompanyCard from "./contact-form/company-card";

interface ContactFormProps {
  isNew: boolean;
}

export default function ContactForm({ isNew }: ContactFormProps) {
  const router = useRouter();
  const params = useParams();
  const queryParams = useSearchParams()
  const contactId = params?.id ? parseInt(params.id as string) : null;
  const companyId = queryParams.get('companyId') || "";

  // Hooks
  const { contact, loading: loadingContact } = useContact(contactId || 0);
  const { createContact, updateContact, isCreating, isUpdating } =
    useContactMutations();
  const { validateEmailUnique, isValidating } = useContactValidation();

  const [formData, setFormData] = useState({
    companyId: companyId,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobilePhone: "",
    position: "",
    department: "",
    isPrimaryContact: false,
    active: true,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load contact data quando editing
  useEffect(() => {
    if (!isNew && contact) {
      setFormData({
        companyId: contact.companyId.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || "",
        mobilePhone: contact.mobilePhone || "",
        position: contact.position || "",
        department: contact.department || "",
        isPrimaryContact: contact.isPrimaryContact,
        active: contact.active,
        notes: contact.notes || "",
      });
    }
  }, [contact, isNew]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = async (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validazione email unica
    if (field === "email" && formData.email && formData.companyId) {
      const isUnique = await validateEmailUnique(
        formData.email,
        parseInt(formData.companyId),
        isNew ? undefined : contactId || undefined
      );

      if (!isUnique) {
        setErrors((prev) => ({
          ...prev,
          email: "Email già esistente per questa azienda",
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = "Azienda è obbligatoria";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Nome è obbligatorio";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Cognome è obbligatorio";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email è obbligatoria";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email non valida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CreateContactInput | UpdateContactInput = {
      companyId: parseInt(formData.companyId),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
      mobilePhone: formData.mobilePhone || null,
      position: formData.position || null,
      department: formData.department || null,
      isPrimaryContact: formData.isPrimaryContact,
      active: formData.active,
      notes: formData.notes || null,
    };

    try {
      if (isNew) {
        const newContact = await createContact(data as CreateContactInput);
        router.push(`/contacts/${newContact.id}`);
      } else if (contactId) {
        await updateContact(contactId, data);
        router.push(`/contacts/${contactId}`);
      }
    } catch (error) {
      console.error("Form submit error:", error);
    }
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

  if (!isNew && loadingContact) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isNew ? "Nuovo Contatto" : "Modifica Contatto"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isNew
            ? "Inserisci i dati del nuovo contatto"
            : "Aggiorna le informazioni del contatto"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Azienda */}
        <CompanyCard
          companyId={formData.companyId}
          onCompanyChange={(id) => handleChange("companyId", id)}
          error={errors.companyId}
        />

        {/* Dati Personali */}
        <Card>
          <CardHeader>
            <CardTitle>Dati Personali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                  placeholder="Mario"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Cognome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                  placeholder="Rossi"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="mario.rossi@example.com"
                />
                {isValidating && touched.email && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+39 02 1234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobilePhone">Cellulare</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  value={formData.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  placeholder="+39 333 1234567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ruolo Aziendale */}
        <Card>
          <CardHeader>
            <CardTitle>Ruolo Aziendale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posizione</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="Responsabile vendite"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Dipartimento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="Commerciale"
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPrimaryContact">Contatto Primario</Label>
                <p className="text-sm text-gray-500">
                  Imposta come contatto principale per l'azienda
                </p>
              </div>
              <Switch
                id="isPrimaryContact"
                checked={formData.isPrimaryContact}
                onCheckedChange={(checked) =>
                  handleChange("isPrimaryContact", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Attivo</Label>
                <p className="text-sm text-gray-500">
                  Il contatto può essere utilizzato nel sistema
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleChange("active", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
            <CardDescription>
              Aggiungi informazioni aggiuntive sul contatto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Inserisci note..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting
              ? "Salvataggio..."
              : isNew
              ? "Crea Contatto"
              : "Salva Modifiche"}
          </Button>
        </div>
      </form>
    </div>
  );
}
