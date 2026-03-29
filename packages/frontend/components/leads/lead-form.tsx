// components/leads/lead-form.tsx
"use client";

import { useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, Building2, User, MapPin, TrendingUp,
  ShieldCheck, Megaphone,
} from "lucide-react";
import { CreateLeadFormInput, createLeadSchema, Lead, UpdateLeadFormInput, updateLeadSchema } from "@mini-erp/shared";
import { createLeadAction, updateLeadAction } from "@/actions/lead";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toDateInput } from "@/helpers/date";

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS = [
  { value: "NEW",         label: "Nuovo" },
  { value: "CONTACTED",   label: "Contattato" },
  { value: "QUALIFIED",   label: "Qualificato" },
  { value: "UNQUALIFIED", label: "Non qualificato" },
  { value: "NURTURING",   label: "Nurturing" },
  { value: "LOST",        label: "Perso" },
  { value: "ARCHIVED",    label: "Archiviato" },
] as const;

const SOURCE_OPTIONS = [
  { value: "WEBSITE",         label: "Website" },
  { value: "REFERRAL",        label: "Referral" },
  { value: "SOCIAL_MEDIA",    label: "Social Media" },
  { value: "EMAIL_CAMPAIGN",  label: "Email Campaign" },
  { value: "PHONE_CALL",      label: "Telefono" },
  { value: "COLD_CALL",       label: "Cold Call" },
  { value: "EVENT",           label: "Evento" },
  { value: "PARTNER",         label: "Partner" },
  { value: "ADVERTISING",     label: "Pubblicità" },
  { value: "CONTENT",         label: "Contenuto" },
  { value: "DIRECT",          label: "Diretto" },
  { value: "CHAT",            label: "Chat" },
  { value: "OTHER",           label: "Altro" },
] as const;

const QUALITY_OPTIONS = [
  { value: "HOT",  label: "🔥 Hot" },
  { value: "WARM", label: "♨️ Warm" },
  { value: "COLD", label: "❄️ Cold" },
] as const;

const SIZE_OPTIONS = [
  { value: "MICRO",      label: "Micro (1-9)" },
  { value: "SMALL",      label: "Piccola (10-49)" },
  { value: "MEDIUM",     label: "Media (50-249)" },
  { value: "LARGE",      label: "Grande (250-999)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
] as const;

const TIMEFRAME_OPTIONS = [
  { value: "IMMEDIATE",      label: "Immediato" },
  { value: "1_3_MONTHS",     label: "1-3 mesi" },
  { value: "3_6_MONTHS",     label: "3-6 mesi" },
  { value: "6_12_MONTHS",    label: "6-12 mesi" },
  { value: "12_PLUS_MONTHS", label: "Oltre 12 mesi" },
] as const;

const AUTHORITY_OPTIONS = [
  { value: "DECISION_MAKER", label: "Decision Maker" },
  { value: "INFLUENCER",     label: "Influencer" },
  { value: "GATEKEEPER",     label: "Gatekeeper" },
  { value: "USER",           label: "User" },
] as const;

// ============================================================================
// Form value type — derived from the raw shape (no refinements).
// Both create and update schemas are supersets/subsets of this shape,
// so using it as the single generic keeps TypeScript happy.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

type LeadFormMode = "create" | "edit";
type LeadFormValues = CreateLeadFormInput & Partial<UpdateLeadFormInput>;


interface LeadFormProps {
  mode: LeadFormMode;
  lead?: Lead;
}

// ============================================================================
// Component
// ============================================================================

export function LeadForm({ mode, lead }: LeadFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Pick the right schema at runtime — both are compatible with LeadFormValues
  // because updateLeadSchema is .partial() of the same shape, and
  // createLeadSchema adds only .refine() on top.
  const schema = useMemo(
    () => (isEdit ? updateLeadSchema : createLeadSchema),
    [isEdit]
  );

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(schema) as Resolver<LeadFormValues>,
    defaultValues: {
      // Azienda
      companyName: lead?.companyName ?? "",
      tradeName: lead?.tradeName ?? "",
      website: lead?.website ?? "",
      vatNumber: lead?.vatNumber ?? "",
      taxCode: lead?.taxCode ?? "",
      countryCode: lead?.countryCode ?? "IT",
      // Contatto
      contactFirstName: lead?.contactFirstName ?? "",
      contactLastName: lead?.contactLastName ?? "",
      contactEmail: lead?.contactEmail ?? "",
      contactPhone: lead?.contactPhone ?? "",
      contactMobile: lead?.contactMobile ?? "",
      contactPosition: lead?.contactPosition ?? "",
      contactDepartment: lead?.contactDepartment ?? "",
      // Indirizzo
      address: lead?.address ?? "",
      city: lead?.city ?? "",
      provinceCode: lead?.provinceCode ?? "",
      zipCode: lead?.zipCode ?? "",
      // Gestione lead
      status: lead?.status ?? "NEW",
      source: lead?.source ?? "OTHER",
      quality: lead?.quality ?? "COLD",
      score: lead?.score ?? 0,
      // Commerciale
      estimatedValue: lead?.estimatedValue ? String(lead.estimatedValue) : undefined,
      estimatedSize: lead?.estimatedSize ?? undefined,
      industry: lead?.industry ?? "",
      employeesCount: lead?.employeesCount ?? undefined,
      annualRevenue: lead?.annualRevenue ? String(lead.annualRevenue) : undefined,
      budget: lead?.budget ? String(lead.budget) : undefined,
      purchaseTimeframe: lead?.purchaseTimeframe ?? undefined,
      decisionAuthority: lead?.decisionAuthority ?? undefined,
      primaryNeed: lead?.primaryNeed ?? "",
      interestedIn: lead?.interestedIn ?? "",
      competitors: lead?.competitors ?? "",
      notes: lead?.notes ?? "",
      description: lead?.description ?? "",
      nextFollowUpDate: toDateInput(lead?.nextFollowUpDate),
      // GDPR
      privacyConsent: lead?.privacyConsent ?? false,
      privacyConsentDate: toDateInput(lead?.privacyConsentDate),
      marketingConsent: lead?.marketingConsent ?? false,
      marketingConsentDate: toDateInput(lead?.marketingConsentDate),
      doNotCall: lead?.doNotCall ?? false,
      doNotEmail: lead?.doNotEmail ?? false,
      // Tracking
      campaignName: lead?.campaignName ?? "",
      utmSource: lead?.utmSource ?? "",
      utmMedium: lead?.utmMedium ?? "",
      utmCampaign: lead?.utmCampaign ?? "",
      landingPage: lead?.landingPage ?? "",
      referrer: lead?.referrer ?? "",
    },
  });

  const isPending = form.formState.isSubmitting;
  const privacyConsent = form.watch("privacyConsent");
  const marketingConsent = form.watch("marketingConsent");

  const onSubmit = async (data: LeadFormValues) => {
    if (isEdit && lead) {
      const result = await updateLeadAction(lead.id, data as UpdateLeadFormInput);
      if (result.success) {
        toast.success("Lead aggiornata");
        router.push(`/leads/${lead.id}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Errore durante l'aggiornamento");
      }
    } else {
      const result = await createLeadAction(data as CreateLeadFormInput);
      if (result.success) {
        toast.success("Lead creata");
        router.push(`/leads/${(result.data as any)?.id}`);
      } else {
        toast.error(result.error ?? "Errore durante la creazione");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="azienda">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="azienda" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Azienda
            </TabsTrigger>
            <TabsTrigger value="contatto" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Contatto
            </TabsTrigger>
            <TabsTrigger value="indirizzo" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Indirizzo
            </TabsTrigger>
            <TabsTrigger value="commerciale" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Commerciale
            </TabsTrigger>
            <TabsTrigger value="gdpr" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              GDPR
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-1.5">
              <Megaphone className="h-3.5 w-3.5" />
              Tracking
            </TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Azienda                                                    */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="azienda">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {/* Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ragione sociale <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Acme S.r.l." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tradeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome commerciale</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>P.IVA</FormLabel>
                        <FormControl>
                          <Input placeholder="IT12345678901" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice fiscale</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paese</FormLabel>
                        <FormControl>
                          <Input placeholder="IT" maxLength={2} {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>Codice ISO 2 lettere</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3 */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://acme.com"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Lead management */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SOURCE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualità</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {QUALITY_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextFollowUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prossimo follow-up</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Note generali..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Contatto                                                   */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="contatto">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cognome <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Rossi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mario.rossi@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+39 02 1234567"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+39 333 1234567"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posizione</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CEO, CFO, IT Manager..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactDepartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dipartimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acquisti, IT, Direzione..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Indirizzo                                                  */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="indirizzo">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input placeholder="Via Roma 1" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="Milano" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provinceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MI"
                            maxLength={2}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder="20100" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Commerciale                                                */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="commerciale">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valore stimato (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="50000"
                            {...field}
                            value={String(field.value) ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="30000"
                            {...field}
                            value={String(field.value) ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="annualRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fatturato annuo (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={String(field.value) ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeesCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° dipendenti</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Settore</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Es. Manifatturiero, IT, Retail..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensione azienda</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SIZE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="purchaseTimeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeframe acquisto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMEFRAME_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="decisionAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autorità decisionale</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AUTHORITY_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="primaryNeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Necessità principale</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Descrivi il problema o la necessità principale..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interessato a</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder="Prodotti o servizi di interesse..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="competitors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concorrenti</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder="Soluzioni concorrenti in uso o in valutazione..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — GDPR                                                       */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="gdpr">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Privacy */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="privacyConsent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Consenso privacy</FormLabel>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Il lead ha accettato l&apos;informativa privacy
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {privacyConsent && (
                    <FormField
                      control={form.control}
                      name="privacyConsentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Data consenso privacy <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Marketing */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="marketingConsent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Consenso marketing</FormLabel>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Il lead acconsente a comunicazioni marketing
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {marketingConsent && (
                    <FormField
                      control={form.control}
                      name="marketingConsentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Data consenso marketing <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator />

                {/* Do not contact */}
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="doNotCall"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel>Non chiamare</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doNotEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel>Non inviare email</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Tracking                                                   */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="tracking">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="campaignName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome campagna</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Es. Newsletter Q1 2026"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="utmSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Source</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="google, newsletter..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmMedium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Medium</FormLabel>
                        <FormControl>
                          <Input placeholder="cpc, email..." {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmCampaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Campaign</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="spring_sale..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="landingPage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landing page</FormLabel>
                        <FormControl>
                          <Input placeholder="/prodotti/erp" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referrer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referrer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://google.com"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Salva modifiche" : "Crea lead"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
