// components/leads/lead-form.tsx
"use client";

import { useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Building2, User, MapPin, TrendingUp, ShieldCheck, Megaphone } from "lucide-react";
import {
  CreateLeadFormInput,
  createLeadSchema,
  Lead,
  UpdateLeadFormInput,
  updateLeadSchema,
} from "@mini-erp/shared";
import { createLeadAction, updateLeadAction } from "@/actions/lead-actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toDateInput } from "@/helpers/date-helper";
import { CountryCombobox } from "@/components/combobox/country-combobox";
import { useNavigation } from "@/hooks/use-navigation";
import { useTranslations } from "next-intl";
import {
  getDecisionAuthorityOptions,
  getLeadQualityOptions,
  getLeadSourceOptions,
  getLeadStatusOptions,
  getLeadPurchaseTimeframeOptions,
} from "@/helpers/lead-helper";
import { getCustomerSizeOptions } from "@/helpers/customer-helper";
import { FormFooter } from "@/components/form/form-footer";
import { formatDecimalForInput } from "@/utils/format-decimal";

// ============================================================================
// Form value type — derived from the raw shape (no refinements).
// Both create and update schemas are supersets/subsets of this shape,
// so using it as the single generic keeps TypeScript happy.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

type LeadFormMode = "create" | "edit";

interface LeadFormProps {
  mode: LeadFormMode;
  lead?: Lead;
}

// ============================================================================
// Component
// ============================================================================

export function LeadForm({ mode, lead }: LeadFormProps) {
  const isEdit = mode === "edit";
  const { navigateToDetail, navigate } = useNavigation();

  const defaultValues = {
    // Azienda
    companyName: lead?.companyName ?? "",
    tradeName: lead?.tradeName ?? "",
    website: lead?.website ?? "",
    vatNumber: lead?.vatNumber ?? "",
    taxCode: lead?.taxCode ?? "",
    countryCode: lead?.countryCode ?? "",
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
    estimatedValue: formatDecimalForInput(lead?.estimatedValue),
    estimatedSize: lead?.estimatedSize ?? undefined,
    industry: lead?.industry ?? "",
    employeesCount: lead?.employeesCount ?? undefined,
    annualRevenue: formatDecimalForInput(lead?.annualRevenue),
    budget: formatDecimalForInput(lead?.budget),
    purchaseTimeframe: lead?.purchaseTimeframe ?? undefined,
    decisionAuthority: lead?.decisionAuthority ?? undefined,
    primaryNeed: lead?.primaryNeed ?? "",
    interestedIn: lead?.interestedIn ?? "",
    competitors: lead?.competitors ?? "",
    notes: lead?.notes ?? "",
    description: lead?.description ?? "",
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
  };

  const createForm = useForm<CreateLeadFormInput>({
    resolver: zodResolver(createLeadSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultValues,
    },
  });

  const updateForm = useForm<UpdateLeadFormInput>({
    resolver: zodResolver(updateLeadSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultValues,
    },
  });

  // cast a any solo per il provider — type-safety mantenuta nei singoli hook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useMemo(() => (isEdit ? updateForm : createForm) as any, [isEdit]);

  const isPending = form.formState.isSubmitting;
  const privacyConsent = form.watch("privacyConsent");
  const marketingConsent = form.watch("marketingConsent");
  const t = useTranslations("crm.leads");
  const tc = useTranslations("crm.customers");

  const onSubmit = async (data: CreateLeadFormInput | UpdateLeadFormInput) => {
    if (isEdit && lead) {
      const result = await updateLeadAction(lead.id, data as UpdateLeadFormInput);
      if (result.success) {
        toast.success("Lead aggiornata");
        navigateToDetail("leads", lead.id);
      } else {
        toast.error(result.error ?? "Errore durante l'aggiornamento");
      }
    } else {
      const result = await createLeadAction(data as CreateLeadFormInput);
      if (result.success && result.data) {
        toast.success("Lead creata");
        navigateToDetail("leads", result.data.id);
      } else {
        toast.error(result.error ?? "Errore durante la creazione");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="company">
          <TabsList variant="line" className="crm-tabs-list">
            <TabsTrigger value="company">
              <Building2 className="h-3.5 w-3.5" />
              {t("tabs.company")}
            </TabsTrigger>
            <TabsTrigger value="contact">
              <User className="h-3.5 w-3.5" />
              {t("tabs.contact")}
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin className="h-3.5 w-3.5" />
              {t("tabs.address")}
            </TabsTrigger>
            <TabsTrigger value="commercial">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("tabs.commercial")}
            </TabsTrigger>
            <TabsTrigger value="gdpr">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("tabs.gdpr")}
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Megaphone className="h-3.5 w-3.5" />
              {t("tabs.tracking")}
            </TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — company                                                    */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="company">
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
                          {t("form.companyName")} <span className="text-destructive">*</span>
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
                        <FormLabel>{t("form.tradeName")}</FormLabel>
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
                        <FormLabel>{t("form.vatNumber")}</FormLabel>
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
                        <FormLabel>{t("form.taxCode")}</FormLabel>
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
                        <FormLabel>{t("form.country")}</FormLabel>
                        <FormControl>
                          <CountryCombobox
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
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
                      <FormLabel>{t("form.website")}</FormLabel>
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
                <div className="grid gap-4 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.status")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getLeadStatusOptions(t).map((o) => (
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
                        <FormLabel>{t("form.source")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getLeadSourceOptions(t).map((o) => (
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
                        <FormLabel>{t("form.quality")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getLeadQualityOptions(t).map((o) => (
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
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.score")}</FormLabel>
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
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.note")}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder={t("form.notePlaceholder")}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Contatto                                                   */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="contact">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.contactName")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.contactNamePlaceholder")} {...field} />
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
                          {t("form.contactLastName")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.contactLastNamePlaceholder")} {...field} />
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
                        {t("form.contactEmail")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("form.contactEmailPlaceholder")}
                          {...field}
                        />
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
                        <FormLabel>{t("form.contactPhone")}</FormLabel>
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
                        <FormLabel>{t("form.contactMobile")}</FormLabel>
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
                        <FormLabel>{t("form.contactPosition")}</FormLabel>
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
                        <FormLabel>{t("form.contactDepartment")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.contactDepartmentPlaceholder")}
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
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Address                                                    */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="address">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.address")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.addressPlaceholder")}
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.city")}</FormLabel>
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
                        <FormLabel>{t("form.provinceCode")}</FormLabel>
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
                        <FormLabel>{t("form.zipCode")}</FormLabel>
                        <FormControl>
                          <Input placeholder="20100" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Commercial                                                 */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="commercial">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.estimatedValue")} (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="50000"
                            {...field}
                            value={String(field.value) ?? ""}
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
                        <FormLabel>{t("form.budget")} (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="30000"
                            {...field}
                            value={String(field.value) ?? ""}
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
                        <FormLabel>{t("form.annualRevenue")} (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            step="0.01"
                            {...field}
                            value={String(field.value) ?? ""}
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
                        <FormLabel>{t("form.employeesCount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="1"
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
                        <FormLabel>{t("form.industry")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.industryPlaceholder")}
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
                        <FormLabel>{t("form.estimatedSize")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.selectPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getCustomerSizeOptions(tc).map((o) => (
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
                        <FormLabel>{t("form.purchaseTimeframe")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.selectPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getLeadPurchaseTimeframeOptions(t).map((o) => (
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
                        <FormLabel>{t("form.decisionAuthority")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.selectPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getDecisionAuthorityOptions(t).map((o) => (
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
                      <FormLabel>{t("form.primaryNeed")}:</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder={t("form.primaryNeedPlaceholder")}
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
                      <FormLabel>{t("form.interestedIn")}:</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder={t("form.interestedInPlaceholder")}
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
                      <FormLabel>{t("form.competitors")}:</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder={t("form.competitorsPlaceholder")}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
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
                          <FormLabel>{t("form.privacyConsent")}</FormLabel>
                          <p className="text-xs text-muted-foreground pt-1">
                            {t("form.privacyConsentDescription")}
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
                            {t("form.privacyConsentDate")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? undefined} />
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
                          <FormLabel>{t("form.marketingConsent")}</FormLabel>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("form.marketingConsentDescription")}
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
                            {t("form.marketingConsentDate")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? undefined} />
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
                        <FormLabel>{t("form.doNotCall")}</FormLabel>
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
                        <FormLabel>{t("form.doNotEmail")}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
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
                      <FormLabel>{t("form.campaign.label")}</FormLabel>
                      <FormControl>
                        <Input
                          title={t("form.campaign.description")}
                          placeholder={t("form.campaign.placeholder", {
                            year: new Date().getFullYear(),
                          })}
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
                        <FormLabel>{t("form.utmSource.label")}</FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.utmSource.description")}
                            placeholder={t("form.utmSource.placeholder")}
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
                        <FormLabel>{t("form.utmMedium.label")}</FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.utmMedium.description")}
                            placeholder={t("form.utmMedium.placeholder")}
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
                    name="utmCampaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.utmCampaign.label")}</FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.utmCampaign.description")}
                            placeholder={t("form.utmCampaign.placeholder", {
                              year: new Date().getFullYear(),
                            })}
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
                        <FormLabel>{t("form.landingPage.label")}</FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.landingPage.description")}
                            placeholder={t("form.landingPage.placeholder")}
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
                    name="referrer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.referrer.label")}</FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.referrer.description")}
                            placeholder={t("form.referrer.placeholder")}
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
            </Card>
          </TabsContent>
          <FormFooter
            entityKey="leads"
            entityId={lead?.id}
            isEditMode={isEdit}
            isPending={isPending}
          />
        </Tabs>
      </form>
    </Form>
  );
}
