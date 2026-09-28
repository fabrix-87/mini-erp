// components/activity/form/activity-form-basic-info.tsx
"use client";

import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityFormData } from "@/types/activitiy-types";
import { Customer } from "@/types/customer-types";
import { CreateActivityFormValues, Lead } from "@mini-erp/shared";
import { CustomerCombobox } from "@/components/combobox/customer-combobox";
import { LeadCombobox } from "@/components/combobox/lead-combobox";
import { ContactCombobox } from "@/components/combobox/contact-combobox";
import { getActivityPriorityOptions, getActivityTypeOptions } from "@/helpers/activity-helpers";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LEAD_STATUS_CLASS_NAMES } from "@/helpers/lead-helper";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ActivityFormBasicInfo() {
  const t = useTranslations("activities");
  const tc = useTranslations("crm.customers");
  const { control, getValues, setValue, clearErrors, watch } =
    useFormContext<CreateActivityFormValues>();
  const showLocationField = ["MEETING", "SITE_VISIT", "VIDEO_CALL"].includes(getValues("type"));
  const [selectedCustomer, setCustomer] = useState<Customer | undefined>();
  const [selectedLead, setLead] = useState<Lead | undefined>();

  const watchedLeadId = watch("leadId");
  const watchedCustomerId = watch("customerId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tabs.basicTitle")}</CardTitle>
        <CardDescription>{t("tabs.basicDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.type")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
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
                      {getActivityTypeOptions(t).map((o) => (
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

          <div className="space-y-2">
            <FormField
              control={control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.priority")}</FormLabel>
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
                      {getActivityPriorityOptions(t).map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormField
            control={control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.subject")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.subjectPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.description")}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t("form.descriptionPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Customer o Lead Selection con Combobox */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormField
              control={control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.customer")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <CustomerCombobox
                      value={field.value ?? ""}
                      disabled={!!watchedLeadId}
                      onValueChange={(value) => {
                        field.onBlur();
                        field.onChange(value || null);
                        // Se seleziono un customer, disabilito e resetto il lead
                        if (value) {
                          setValue("leadId", null);
                          clearErrors("leadId");
                        }else{
                          setValue("contactId", null);
                        }
                      }}
                      onItemChange={(customer) => setCustomer(customer)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Cliente Selezionato */}
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedCustomer.company.companyName}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>{tc('code')}: {selectedCustomer.company.code}</div>
                  {selectedCustomer.company.vatNumber && (
                    <div>{tc('form.vatNumber')}: {selectedCustomer.company.vatNumber}</div>
                  )}
                  {selectedCustomer.company.mainEmail && (
                    <div>{tc('form.contactEmail')}: {selectedCustomer.company.mainEmail}</div>
                  )}
                  {selectedCustomer.company.mainPhone && (
                    <div>{tc('form.contactPhone')}: {selectedCustomer.company.mainPhone}</div>
                  )}
                  <div className="flex gap-2 mt-1">                    
                    <Badge variant="secondary" className="text-xs">
                      {selectedCustomer.segment}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {selectedCustomer.type}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <FormField
              control={control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.lead")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <LeadCombobox
                      value={field.value ?? ""}
                      disabled={!!watchedCustomerId}
                      onValueChange={(value) => {
                        field.onBlur();
                        field.onChange(value || null);
                        // Se seleziono un lead, disabilito e resetto il customer
                        if (value) {
                          setValue("customerId", null);
                          clearErrors("customerId");
                        }
                      }}
                      onItemChange={(lead) => setLead(lead)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Lead Selezionato */}
            {selectedLead && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ({selectedLead.code}) • {selectedLead.companyName}
                  </span>
                  <Badge className={LEAD_STATUS_CLASS_NAMES[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>
                    {selectedLead.contactFirstName} {selectedLead.contactLastName} •{" "}
                    {selectedLead.contactEmail}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Selection con Combobox */}
        <div className="space-y-2">
          <FormField
            control={control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.contact")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <ContactCombobox
                    disabled={!watchedCustomerId}
                    value={field.value ?? ""}
                    customerId={watchedCustomerId ?? undefined}
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
        </div>

        {showLocationField && (
          <div className="space-y-2">
            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.location")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("form.locationPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
