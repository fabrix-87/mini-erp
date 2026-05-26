// packages/frontend/components/company/tabs/fiscal-data-tab.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { CompanyFormValues } from "@mini-erp/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldError } from "@/components/ui/form-field-error";

export function FiscalDataTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Fiscali</CardTitle>
        <CardDescription>Informazioni per fatturazione e adempimenti fiscali</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Partita IVA</Label>
            <Input id="vatNumber" {...register("vatNumber")} placeholder="IT12345678901" />
            <FormFieldError error={errors.vatNumber} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxCode">Codice Fiscale</Label>
            <Input id="taxCode" {...register("taxCode")} placeholder="12345678901" />
            <FormFieldError error={errors.taxCode} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sdiCode">Codice SDI</Label>
            <Input id="sdiCode" {...register("sdiCode")} placeholder="ABCDEFG" maxLength={7} />
            <p className="text-xs text-muted-foreground">
              Codice destinatario per fatturazione elettronica
            </p>
            <FormFieldError error={errors.sdiCode} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pec">PEC</Label>
            <Input id="pec" type="email" {...register("pec")} placeholder="azienda@pec.it" />
            <FormFieldError error={errors.pec} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eoriNumber">EORI Number</Label>
            <Input id="eoriNumber" {...register("eoriNumber")} placeholder="IT123456789000" />
            <p className="text-xs text-muted-foreground">Per transazioni extra UE</p>
            <FormFieldError error={errors.eoriNumber} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatId">VAT ID (UE)</Label>
            <Input id="vatId" {...register("vatId")} placeholder="FR12345678901" />
            <p className="text-xs text-muted-foreground">Per clienti/fornitori UE</p>
            <FormFieldError error={errors.vatId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
