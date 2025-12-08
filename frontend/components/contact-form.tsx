// app/(dashboard)/contacts/[id]/edit/page.tsx o new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UserCircle,
  Building2,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CreateContactData } from "@/types/contact";
import { getCompany, searchCompanies } from "@/lib/api/modules/company";
import {
  createContact,
  getContact,
  updateContact,
} from "@/lib/api/modules/contact";
import { cleanStringOrUndefined } from "@/lib/api/helpers";

interface Company {
  id: number;
  code: string;
  companyName: string;
  tradeName: string;
}

export default function ContactFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isEditMode = !!params?.id;
  const contactId = params?.id as string;
  const preselectedCompanyId = searchParams.get("companyId");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchingCompany, setSearchingCompany] = useState(false);

  useEffect(() => {
    if (preselectedCompanyId) {
      fetchCompany(parseInt(preselectedCompanyId));
    }
  }, [preselectedCompanyId]);

  const fetchCompany = async (companyId: number) => {
    try {
      const existingCompany = await getCompany(companyId);
      if (existingCompany.status === "success") {
        setCompanies([existingCompany.data]);
      }
    } catch (error) {
      toast.error("Errore durante il recupero dell'azienda");
      router.push("/dashboard/contacts/new");
    }
  };

  const [formData, setFormData] = useState<CreateContactData>({
    companyId: preselectedCompanyId || "",
    salutation: "mr",
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    contactType: "other",
    decisionLevel: "employee",
    email: "",
    secondaryEmail: "",
    phone: "",
    mobile: "",
    directLine: "",
    extension: "",
    skype: "",
    linkedinUrl: "",
    whatsapp: "",
    telegram: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    country: "IT",
    isPrimary: false,
    isDecisionMaker: false,
    active: true,
    preferredContactMethod: "email",
    preferredLanguage: "it-IT",
    acceptsMarketing: false,
    acceptsNewsletter: false,
    birthDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await getContact(parseInt(contactId));
      const contact = response.data;

      const companyRes = await getCompany(contact.companyId)
      setCompanies([companyRes.data])

      setFormData({
        companyId: contact.Company?.id.toString() || "",
        salutation: contact.salutation || "mr",
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        jobTitle: contact.jobTitle || "",
        department: contact.department || "",
        contactType: contact.contactType || "other",
        decisionLevel: contact.decisionLevel || "employee",
        email: contact.email || "",
        secondaryEmail: contact.secondaryEmail || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        directLine: contact.directLine || "",
        extension: contact.extension || "",
        skype: contact.skype || "",
        linkedinUrl: contact.linkedinUrl || "",
        whatsapp: contact.whatsapp || "",
        telegram: contact.telegram || "",
        address: contact.address || "",
        city: contact.city || "",
        postalCode: contact.postalCode || "",
        province: contact.province || "",
        country: contact.country || "IT",
        isPrimary: contact.isPrimary || false,
        isDecisionMaker: contact.isDecisionMaker || false,
        active: contact.active !== false,
        preferredContactMethod: contact.preferredContactMethod || "email",
        preferredLanguage: contact.preferredLanguage || "it-IT",
        acceptsMarketing: contact.acceptsMarketing || false,
        acceptsNewsletter: contact.acceptsNewsletter || false,
        birthDate: contact.birthDate ? contact.birthDate.split("T")[0] : "",
        notes: contact.notes || "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/dashboard/contacts");
    } finally {
      setLoading(false);
    }
  };

  const searchCompaniesFunc = async (query: string) => {
    if (query.length < 2) return;

    setSearchingCompany(true);
    try {
      const response = await searchCompanies(query, 10);
      setCompanies(response.data);
    } catch (error) {
      console.error("Error searching companies:", error);
    } finally {
      setSearchingCompany(false);
    }
  };

  const handleChange = (field: keyof CreateContactData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        companyId: parseInt(formData.companyId),
        birthDate: formData.birthDate || undefined,
        secondaryEmail: cleanStringOrUndefined(formData.secondaryEmail),
      };

      if (isEditMode) {
        await updateContact(parseInt(contactId), payload);
        toast.success("Contatto aggiornato con successo");
        router.push(`/dashboard/contacts/${contactId}`);
      } else {
        const response = await createContact(payload);
        toast.success("Contatto creato con successo");
        router.push(`/dashboard/contacts/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante il salvataggio"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Modifica Contatto" : "Nuovo Contatto"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Aggiorna le informazioni del contatto"
                : "Crea un nuovo contatto aziendale"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            <UserCircle className="mr-2 h-4 w-4" />
            Dati Personali
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            Azienda
          </TabsTrigger>
          <TabsTrigger value="contact">
            <PhoneIcon className="mr-2 h-4 w-4" />
            Recapiti
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Dati Personali */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Anagrafiche</CardTitle>
              <CardDescription>
                Dati identificativi del contatto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="salutation">Titolo</Label>
                  <Select
                    value={formData.salutation}
                    onValueChange={(value) => handleChange("salutation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Sig.</SelectItem>
                      <SelectItem value="ms">Sig.ra</SelectItem>
                      <SelectItem value="mrs">Sig.ra (sposata)</SelectItem>
                      <SelectItem value="dr">Dott.</SelectItem>
                      <SelectItem value="prof">Prof.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                    placeholder="Mario"
                  />
                </div>

                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor="lastName">Cognome *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                    placeholder="Rossi"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jobTitle">Ruolo / Posizione</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    placeholder="Es: Responsabile Acquisti"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department">Dipartimento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="Es: Ufficio Acquisti"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="birthDate">Data di Nascita</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Note sul Contatto</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Informazioni aggiuntive, preferenze, annotazioni..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Azienda */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Azienda di Appartenenza</CardTitle>
              <CardDescription>
                Seleziona l'azienda a cui appartiene questo contatto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Azienda *</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleChange("companyId", value)}
                  disabled={isEditMode} // Non modificabile in edit
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cerca e seleziona azienda..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                      >
                        {company.companyName} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isEditMode && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Cerca azienda per nome o P.IVA..."
                      onChange={(e) => searchCompaniesFunc(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open("/companies/new", "_blank")}
                    >
                      Nuova Azienda
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactType">Tipo Contatto</Label>
                  <Select
                    value={formData.contactType}
                    onValueChange={(value) =>
                      handleChange("contactType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Principale</SelectItem>
                      <SelectItem value="billing">Amministrativo</SelectItem>
                      <SelectItem value="technical">Tecnico</SelectItem>
                      <SelectItem value="decision_maker">
                        Decision Maker
                      </SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decisionLevel">Livello Decisionale</Label>
                  <Select
                    value={formData.decisionLevel}
                    onValueChange={(value) =>
                      handleChange("decisionLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Direttivo</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Dipendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onCheckedChange={(checked) =>
                      handleChange("isPrimary", checked)
                    }
                  />
                  <Label
                    htmlFor="isPrimary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Contatto principale per l'azienda
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDecisionMaker"
                    checked={formData.isDecisionMaker}
                    onCheckedChange={(checked) =>
                      handleChange("isDecisionMaker", checked)
                    }
                  />
                  <Label
                    htmlFor="isDecisionMaker"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ha potere decisionale
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      handleChange("active", checked)
                    }
                  />
                  <Label htmlFor="active">
                    Contatto {formData.active ? "attivo" : "inattivo"}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recapiti */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Principale *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  placeholder="mario.rossi@azienda.it"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryEmail">Email Secondaria</Label>
                <Input
                  id="secondaryEmail"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) =>
                    handleChange("secondaryEmail", e.target.value)
                  }
                  placeholder="mario.rossi.alt@azienda.it"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telefono</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Cellulare</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="+39 333 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono Fisso</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+39 02 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directLine">Linea Diretta</Label>
                  <Input
                    id="directLine"
                    type="tel"
                    value={formData.directLine}
                    onChange={(e) => handleChange("directLine", e.target.value)}
                    placeholder="+39 02 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extension">Interno</Label>
                  <Input
                    id="extension"
                    value={formData.extension}
                    onChange={(e) => handleChange("extension", e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social & Messaging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      handleChange("linkedinUrl", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skype">Skype</Label>
                  <Input
                    id="skype"
                    value={formData.skype}
                    onChange={(e) => handleChange("skype", e.target.value)}
                    placeholder="mario.rossi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+39 333 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => handleChange("telegram", e.target.value)}
                    placeholder="@mariorossi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferenze Comunicazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">
                    Metodo Preferito
                  </Label>
                  <Select
                    value={formData.preferredContactMethod}
                    onValueChange={(value) =>
                      handleChange("preferredContactMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Telefono</SelectItem>
                      <SelectItem value="mobile">Cellulare</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Lingua Preferita</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) =>
                      handleChange("preferredLanguage", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it-IT">Italiano</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="fr-FR">Français</SelectItem>
                      <SelectItem value="de-DE">Deutsch</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indirizzo (opzionale)</CardTitle>
              <CardDescription>Se diverso dalla sede aziendale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CAP</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    placeholder="20121"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Milano"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    placeholder="MI"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consensi GDPR</CardTitle>
              <CardDescription>
                Gestione consensi per il trattamento dei dati personali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="acceptsMarketing"
                    checked={formData.acceptsMarketing}
                    onCheckedChange={(checked) =>
                      handleChange("acceptsMarketing", checked)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="acceptsMarketing"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Comunicazioni Marketing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Il contatto acconsente a ricevere comunicazioni
                      commerciali e promozionali via email, telefono e altri
                      canali.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="acceptsNewsletter"
                    checked={formData.acceptsNewsletter}
                    onCheckedChange={(checked) =>
                      handleChange("acceptsNewsletter", checked)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="acceptsNewsletter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Newsletter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Il contatto acconsente a ricevere newsletter periodiche
                      con aggiornamenti, novità e contenuti informativi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> I consensi devono essere raccolti in
                  conformità con il GDPR (Regolamento UE 2016/679). Assicurati
                  di aver ottenuto il consenso esplicito e informato del
                  contatto prima di attivare queste opzioni.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" disabled={saving || !formData.companyId}>
          <Save className="mr-2 h-4 w-4" />
          {saving
            ? "Salvataggio..."
            : isEditMode
            ? "Aggiorna"
            : "Crea Contatto"}
        </Button>
      </div>
    </form>
  );
}
