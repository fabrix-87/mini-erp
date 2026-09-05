"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Briefcase, TrendingUp, Package, FileText } from "lucide-react";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  type Opportunity,
  CreateOpportunityFormValues,
  UpdateOpportunityFormValues,
} from "@mini-erp/shared";

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
import { Badge } from "@/components/ui/badge";
import { toDateInput } from "@/helpers/date-helper";
import { useNavigation } from "@/hooks/use-navigation";
import { useTranslations } from "next-intl";
import { OpportunityProposedProducts } from "./opportunity-proposed-products";
import {
  getOpportunityStatusOptions,
  getOpportunitySourceOptions,
  getOpportunityStageOptions,
} from "@/helpers/opportunity-helper";
import { createOpportunityAction, updateOpportunityAction } from "@/actions/opportunity-actions";
import { UserCombobox } from "@/components/ui/user-combobox";
import { CustomerCombobox } from "@/components/ui/customer-combobox";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadCombobox } from "@/components/ui/lead-combobox";

// ============================================================================
// Types
// ============================================================================

type OpportunityFormMode = "create" | "edit";

interface OpportunityFormProps {
  mode: OpportunityFormMode;
  opportunity?: Opportunity;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Unified create/edit form for Opportunity.
 * - In create mode uses createOpportunitySchema (includes leadId/customerId + refine).
 * - In edit mode uses updateOpportunitySchema (immutable FKs shown as read-only badges).
 * Tabs: Generale · Commerciale · Prodotti · Note
 * @param mode - "create" or "edit"
 * @param opportunity - Required in edit mode, populates defaultValues
 */
export function OpportunityForm({ mode, opportunity }: OpportunityFormProps) {
  const isEdit = mode === "edit";
  const { navigateToDetail, navigate } = useNavigation();
  const t = useTranslations("crm.opportunities");
  const [activeTab, setActiveTab] = useState("generale");

  const default_values = {
    title: opportunity?.title ?? "",
    description: opportunity?.description ?? "",
    source: opportunity?.source ?? "OTHER",
    assignedUserId: opportunity?.assignedUserId ?? null,
    status: opportunity?.status ?? "OPEN",
    stage: opportunity?.stage ?? "LEAD_QUALIFICATION",
    estimatedValue: opportunity?.estimatedValue ? String(opportunity.estimatedValue) : undefined,
    probability: opportunity?.probability ?? 0,
    expectedCloseDate: toDateInput(opportunity?.expectedCloseDate),
    proposedProducts: opportunity?.proposedProducts ?? [],
    notes: opportunity?.notes ?? "",
    customFields: opportunity?.customFields ?? null,
  };

  const createForm = useForm<CreateOpportunityFormValues>({
    resolver: zodResolver(createOpportunitySchema),
    mode: "onTouched",
    defaultValues: {
      ...default_values,
      customerId: "",
      leadId: null,
    },
  });

  const updateForm = useForm<UpdateOpportunityFormValues>({
    resolver: zodResolver(updateOpportunitySchema),
    mode: "onTouched",
    defaultValues: {
      ...default_values,
    },
  });

  // cast a any solo per il provider — type-safety mantenuta nei singoli hook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEdit ? updateForm : createForm) as any;

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: Record<string, unknown>) => {
    if (isEdit && opportunity) {
      const result = await updateOpportunityAction(
        opportunity.id,
        data as UpdateOpportunityFormValues,
      );
      if (result.success) {
        toast.success(t("updateSuccess"));
        navigateToDetail("opportunities", opportunity.id);
      } else {
        toast.error(result.error ?? t("updateError"));
      }
    } else {
      const result = await createOpportunityAction(data as CreateOpportunityFormValues);
      if (result.success && result.data) {
        toast.success(t("createSuccess"));
        navigateToDetail("opportunities", result.data.id);
      } else {
        toast.error(result.error ?? t("createError"));
      }
    }
  };

  const footer = (
    <CardFooter className="justify-end gap-2 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          opportunity
            ? navigateToDetail("opportunities", opportunity.id)
            : navigate("opportunities")
        }
        disabled={isPending}
      >
        {t("form.cancel")}
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? t("form.saveChanges") : t("form.create")}
      </Button>
    </CardFooter>
  );

  // Una sola subscription, usata da entrambi i campi
  const watchedCustomerId = createForm.watch("customerId");
  const watchedLeadId = createForm.watch("leadId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="generale" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="generale" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {t("form.tabs.generale")}
            </TabsTrigger>
            <TabsTrigger value="commerciale" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("form.tabs.commerciale")}
            </TabsTrigger>
            <TabsTrigger value="prodotti" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {t("form.tabs.prodotti")}
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {t("form.tabs.note")}
            </TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Generale                                                    */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="generale" forceMount hidden={activeTab !== "generale"}>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("form.title")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("form.titlePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* customerId — editabile solo in create, read-only in edit */}
                {isEdit ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">{t("form.customer")}</p>
                    <Badge variant="secondary" className="text-sm font-normal">
                      {opportunity?.customer?.company?.companyName ??
                        opportunity?.customerId ??
                        "—"}
                    </Badge>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.customer")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <CustomerCombobox
                            placeholder={t("form.customerPlaceholder")}
                            value={field.value ?? ""}
                            disabled={!!watchedLeadId}
                            onValueChange={(value) => {
                              field.onBlur();
                              field.onChange(value || null);
                              // Se seleziono un customer, disabilito e resetto il lead
                              if (value) {
                                createForm.setValue("leadId", null);
                                createForm.clearErrors("leadId");
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* leadId — editabile solo in create, read-only in edit */}
                {isEdit ? (
                  opportunity?.leadId && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">{t("form.lead")}</p>
                      <Badge variant="outline" className="text-sm font-normal">
                        {opportunity?.lead?.companyName ?? opportunity.leadId}
                      </Badge>
                    </div>
                  )
                ) : (
                  <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.lead")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <LeadCombobox
                            placeholder={t("form.leadPlaceholder")}
                            value={field.value ?? ""}
                            disabled={!!watchedCustomerId}
                            onValueChange={(value) => {
                              field.onBlur();
                              field.onChange(value || null);
                              // Se seleziono un lead, disabilito e resetto il customer
                              if (value) {
                                createForm.setValue("customerId", null);
                                createForm.clearErrors("customerId");
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.status")}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onBlur();
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getOpportunityStatusOptions(t).map((o) => (
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
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.stage")}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onBlur();
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getOpportunityStageOptions(t).map((o) => (
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
                        <Select
                          onValueChange={(value) => {
                            field.onBlur();
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getOpportunitySourceOptions(t).map((o) => (
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

                <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.assignedUser")}</FormLabel>
                      <FormControl>
                        <UserCombobox
                          placeholder={t("form.assignedUserPlaceholder")}
                          value={field.value ?? ""}
                          onValueChange={(value) => {
                            field.onBlur();
                            field.onChange(value || null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {footer}
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Commerciale                                                 */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="commerciale" forceMount hidden={activeTab !== "commerciale"}>
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
                            value={String(field.value ?? "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.probability")} (%)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="expectedCloseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.expectedCloseDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {footer}
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Prodotti                                                    */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="prodotti" forceMount hidden={activeTab !== "prodotti"}>
            <Card>
              <CardContent className="pt-6">
                <OpportunityProposedProducts />
              </CardContent>
              {footer}
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* Tab — Note                                                        */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="note">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t("form.descriptionPlaceholder")}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t("form.notesPlaceholder")}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {footer}
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
