// packages/frontend/components/company/tabs/classification-tab.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { CompanyFormValues } from "@mini-erp/shared";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldError } from "@/components/ui/form-field-error";
import { CompanyType } from "@/types/company-types";

interface ClassificationTabProps {
  companyType: CompanyType;
}

export function ClassificationTab({ companyType }: ClassificationTabProps) {
  const { control, register, formState: { errors } } = useFormContext<CompanyFormValues>();

  return (
    <>
      {companyType === "CUSTOMER" && (
        <Card>
          <CardHeader><CardTitle>Classificazione Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo Cliente</Label>
                <Controller name="type" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROSPECT">Prospect</SelectItem>
                      <SelectItem value="CUSTOMER">Cliente</SelectItem>
                      <SelectItem value="PARTNER">Partner</SelectItem>
                      <SelectItem value="OTHER">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                <FormFieldError error={errors.type} />
              </div>
              <div className="space-y-2">
                <Label>Status Credit Check</Label>
                <Controller name="creditStatus" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">In Attesa</SelectItem>
                      <SelectItem value="APPROVED">Approvato</SelectItem>
                      <SelectItem value="REJECTED">Rifiutato</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Corso</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                <FormFieldError error={errors.creditStatus} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Note e Informazioni Aggiuntive</CardTitle>
          <CardDescription>Campi personalizzati in formato JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customFields">Campi Personalizzati (JSON)</Label>
            <Controller name="customFields" control={control} render={({ field }) => (
              <Textarea
                id="customFields"
                value={typeof field.value === "string" ? field.value : JSON.stringify(field.value ?? {}, null, 2)}
                onChange={(e) => {
                  try { field.onChange(JSON.parse(e.target.value)); }
                  catch { field.onChange(e.target.value); }
                }}
                placeholder='{"note": "valore"}'
                rows={6}
                className="font-mono text-sm"
              />
            )} />
            <p className="text-xs text-muted-foreground">Inserisci dati in formato JSON valido</p>
            <FormFieldError error={errors.customFields} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}