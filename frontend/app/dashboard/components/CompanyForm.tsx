// app/(dashboard)/companies/[id]/edit/page.tsx o new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building2,
  FileText,
  CreditCard,
  Users as UsersIcon,
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
import { toast } from "sonner";
import { FormData } from "@/types/company";
import { createCompany, getCompany, updateCompany } from "@/lib/api/modules/company";

export default function CompanyFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params?.id;
  const companyId = params?.id as string;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState<FormData>({
    type: "lead",
    companyName: "",
    tradeName: "",
    legalForm: "",
    vatNumber: "",
    taxCode: "",
    sdiCode: "",
    pecEmail: "",
    reaNumber: "",
    shareCapital: "",
    industry: "",
    subIndustry: "",
    companySize: "small",
    employeesCount: "",
    annualRevenue: "",
    primaryEmail: "",
    primaryPhone: "",
    website: "",
    linkedinUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    legalAddress: "",
    legalCity: "",
    legalPostalCode: "",
    legalProvince: "",
    legalCountry: "IT",
    leadSource: "",
    leadStatus: "new",
    customerSegment: "standard",
    paymentTermDays: "30",
    paymentMethod: "bank_transfer",
    creditLimit: "0",
    discountPercent: "0",
    description: "",
    internalNotes: "",
    active: true,
  });

  
  useEffect(() => {
    if (isEditMode) {
      fetchCompany();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await getCompany(parseInt(companyId));
      const company = response.data;

      if (!company) {
        throw new Error("Azienda non trovata");
      }

      // Popola form con dati esistenti
      setFormData({
        type: company.type || "lead",
        companyName: company.companyName || "",
        tradeName: company.tradeName || "",
        legalForm: company.legalForm || "",
        vatNumber: company.vatNumber || "",
        taxCode: company.taxCode || "",
        sdiCode: company.sdiCode || "",
        pecEmail: company.pecEmail || "",
        reaNumber: company.reaNumber || "",
        shareCapital: company.shareCapital?.toString() || "",
        industry: company.industry || "",
        subIndustry: company.subIndustry || "",
        companySize: company.companySize || "",
        employeesCount: company.employeesCount?.toString() || "",
        annualRevenue: company.annualRevenue?.toString() || "",
        primaryEmail: company.primaryEmail || "",
        primaryPhone: company.primaryPhone || "",
        website: company.website || "",
        linkedinUrl: company.linkedinUrl || "",
        facebookUrl: company.facebookUrl || "",
        instagramUrl: company.instagramUrl || "",
        legalAddress: company.legalAddress || "",
        legalCity: company.legalCity || "",
        legalPostalCode: company.legalPostalCode || "",
        legalProvince: company.legalProvince || "",
        legalCountry: company.legalCountry || "IT",
        leadSource: company.leadSource || "",
        leadStatus: company.leadStatus || "new",
        customerSegment: company.customerSegment || "standard",
        paymentTermDays: company.paymentTermDays?.toString() || "30",
        paymentMethod: company.paymentMethod || "bank_transfer",
        creditLimit: company.creditLimit?.toString() || "0",
        discountPercent: company.discountPercent?.toString() || "0",
        description: company.description || "",
        internalNotes: company.internalNotes || "",
        active: company.active !== false,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/dashboard/companies");
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Conversione numeri
      const payload = {
        ...formData,
        shareCapital: formData.shareCapital
          ? parseFloat(formData.shareCapital)
          : 0,
        employeesCount: formData.employeesCount
          ? parseInt(formData.employeesCount)
          : 0,
        annualRevenue: formData.annualRevenue
          ? parseFloat(formData.annualRevenue)
          : 0,
        paymentTermDays: parseInt(formData.paymentTermDays),
        creditLimit: parseFloat(formData.creditLimit),
        discountPercent: parseFloat(formData.discountPercent),
      };

      if (isEditMode) {
        await updateCompany(parseInt(companyId), payload);
        toast.success("Azienda aggiornata con successo");
        router.push(`/dashboard/companies/${companyId}`);
      } else {
        const response = await createCompany(payload);
        if(response.status !== 'success') {
            toast.success("Azienda creata con successo");
            router.push(`/dashboard/companies/${response.data?.id}`);
        } else {
            toast.error("Errore durante la creazione dell'azienda");
        }
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
              {isEditMode ? "Modifica Azienda" : "Nuova Azienda"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Aggiorna le informazioni aziendali"
                : "Crea una nuova anagrafica"}
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
          <TabsTrigger value="basic">
            <Building2 className="mr-2 h-4 w-4" />
            Dati Base
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <FileText className="mr-2 h-4 w-4" />
            Dati Fiscali
          </TabsTrigger>
          <TabsTrigger value="commercial">
            <CreditCard className="mr-2 h-4 w-4" />
            Commerciale
          </TabsTrigger>
          <TabsTrigger value="classification">
            <UsersIcon className="mr-2 h-4 w-4" />
            Classificazione
          </TabsTrigger>
        </TabsList>

        {/* Dati Base */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Generali</CardTitle>
              <CardDescription>
                Dati identificativi dell'azienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="supplier">Fornitore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Stato</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        handleChange("active", checked)
                      }
                    />
                    <Label>{formData.active ? "Attivo" : "Inattivo"}</Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Ragione Sociale *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                    required
                    placeholder="Es: Acme S.r.l."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nome Commerciale</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    onChange={(e) => handleChange("tradeName", e.target.value)}
                    placeholder="Es: Acme Store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalForm">Forma Giuridica</Label>
                  <Input
                    id="legalForm"
                    value={formData.legalForm}
                    onChange={(e) => handleChange("legalForm", e.target.value)}
                    placeholder="Es: S.r.l., S.p.A."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Settore</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    placeholder="Es: Tecnologia, Retail"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Sottosettore</Label>
                  <Input
                    id="subIndustry"
                    value={formData.subIndustry}
                    onChange={(e) =>
                      handleChange("subIndustry", e.target.value)
                    }
                    placeholder="Es: Software, E-commerce"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Dimensione Aziendale</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) =>
                      handleChange("companySize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (1-9 dip.)</SelectItem>
                      <SelectItem value="small">
                        Piccola (10-49 dip.)
                      </SelectItem>
                      <SelectItem value="medium">
                        Media (50-249 dip.)
                      </SelectItem>
                      <SelectItem value="large">
                        Grande (250-999 dip.)
                      </SelectItem>
                      <SelectItem value="enterprise">
                        Enterprise (1000+ dip.)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeesCount">Numero Dipendenti</Label>
                  <Input
                    id="employeesCount"
                    type="number"
                    value={formData.employeesCount}
                    onChange={(e) =>
                      handleChange("employeesCount", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryEmail">Email Principale</Label>
                  <Input
                    id="primaryEmail"
                    type="email"
                    value={formData.primaryEmail}
                    onChange={(e) =>
                      handleChange("primaryEmail", e.target.value)
                    }
                    placeholder="info@azienda.it"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryPhone">Telefono</Label>
                  <Input
                    id="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={(e) =>
                      handleChange("primaryPhone", e.target.value)
                    }
                    placeholder="+39 02 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.azienda.it"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      handleChange("linkedinUrl", e.target.value)
                    }
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sede Legale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legalAddress">Indirizzo</Label>
                <Input
                  id="legalAddress"
                  value={formData.legalAddress}
                  onChange={(e) => handleChange("legalAddress", e.target.value)}
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="legalPostalCode">CAP</Label>
                  <Input
                    id="legalPostalCode"
                    value={formData.legalPostalCode}
                    onChange={(e) =>
                      handleChange("legalPostalCode", e.target.value)
                    }
                    placeholder="20121"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="legalCity">Città</Label>
                  <Input
                    id="legalCity"
                    value={formData.legalCity}
                    onChange={(e) => handleChange("legalCity", e.target.value)}
                    placeholder="Milano"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalProvince">Provincia</Label>
                  <Input
                    id="legalProvince"
                    value={formData.legalProvince}
                    onChange={(e) =>
                      handleChange("legalProvince", e.target.value)
                    }
                    placeholder="MI"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dati Fiscali */}
        <TabsContent value="fiscal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dati Fiscali</CardTitle>
              <CardDescription>
                Informazioni per fatturazione e adempimenti fiscali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Partita IVA</Label>
                  <Input
                    id="vatNumber"
                    value={formData.vatNumber}
                    onChange={(e) => handleChange("vatNumber", e.target.value)}
                    placeholder="IT12345678901"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCode">Codice Fiscale</Label>
                  <Input
                    id="taxCode"
                    value={formData.taxCode}
                    onChange={(e) => handleChange("taxCode", e.target.value)}
                    placeholder="12345678901"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sdiCode">Codice SDI</Label>
                  <Input
                    id="sdiCode"
                    value={formData.sdiCode}
                    onChange={(e) => handleChange("sdiCode", e.target.value)}
                    placeholder="ABCDEFG"
                    maxLength={7}
                  />
                  <p className="text-xs text-muted-foreground">
                    Codice destinatario per fatturazione elettronica
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pecEmail">PEC</Label>
                  <Input
                    id="pecEmail"
                    type="email"
                    value={formData.pecEmail}
                    onChange={(e) => handleChange("pecEmail", e.target.value)}
                    placeholder="azienda@pec.it"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reaNumber">Numero REA</Label>
                  <Input
                    id="reaNumber"
                    value={formData.reaNumber}
                    onChange={(e) => handleChange("reaNumber", e.target.value)}
                    placeholder="MI-1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shareCapital">Capitale Sociale (€)</Label>
                  <Input
                    id="shareCapital"
                    type="number"
                    step="0.01"
                    value={formData.shareCapital}
                    onChange={(e) =>
                      handleChange("shareCapital", e.target.value)
                    }
                    placeholder="10000.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commerciale */}
        <TabsContent value="commercial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Condizioni Commerciali</CardTitle>
              <CardDescription>
                Termini di pagamento e condizioni di vendita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paymentTermDays">
                    Termini di Pagamento (giorni)
                  </Label>
                  <Input
                    id="paymentTermDays"
                    type="number"
                    value={formData.paymentTermDays}
                    onChange={(e) =>
                      handleChange("paymentTermDays", e.target.value)
                    }
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Metodo di Pagamento</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bonifico Bancario
                      </SelectItem>
                      <SelectItem value="credit_card">
                        Carta di Credito
                      </SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="cash">Contanti</SelectItem>
                      <SelectItem value="check">Assegno</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Fido Commerciale (€)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e) =>
                      handleChange("creditLimit", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Sconto Default (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.01"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      handleChange("discountPercent", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Fatturato Annuo (€)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    step="0.01"
                    value={formData.annualRevenue}
                    onChange={(e) =>
                      handleChange("annualRevenue", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>

                {formData.type === "customer" && (
                  <div className="space-y-2">
                    <Label htmlFor="customerSegment">Segmento Cliente</Label>
                    <Select
                      value={formData.customerSegment}
                      onValueChange={(value) =>
                        handleChange("customerSegment", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classificazione */}
        <TabsContent value="classification" className="space-y-4">
          {formData.type === "lead" && (
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="leadSource">Origine Lead</Label>
                    <Input
                      id="leadSource"
                      value={formData.leadSource}
                      onChange={(e) =>
                        handleChange("leadSource", e.target.value)
                      }
                      placeholder="Es: Website, Referral, Cold Call"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadStatus">Status Lead</Label>
                    <Select
                      value={formData.leadStatus}
                      onValueChange={(value) =>
                        handleChange("leadStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nuovo</SelectItem>
                        <SelectItem value="contacted">Contattato</SelectItem>
                        <SelectItem value="qualified">Qualificato</SelectItem>
                        <SelectItem value="proposal">
                          Proposta Inviata
                        </SelectItem>
                        <SelectItem value="negotiation">
                          In Negoziazione
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Descrizione e Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione Azienda</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Breve descrizione dell'azienda e delle sue attività..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Note Interne</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) =>
                    handleChange("internalNotes", e.target.value)
                  }
                  placeholder="Note riservate visibili solo internamente..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Queste note non sono visibili al cliente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con azioni */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvataggio..." : isEditMode ? "Aggiorna" : "Crea Azienda"}
        </Button>
      </div>
    </form>
  );
}
