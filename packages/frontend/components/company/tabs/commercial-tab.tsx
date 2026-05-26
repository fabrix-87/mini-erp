// packages/frontend/components/company/tabs/commercial-tab.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { CompanyFormInput, CompanyFormValues } from "@mini-erp/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldError } from "@/components/ui/form-field-error";
import { CompanyType } from "@/types/company-types";

interface CommercialTabProps {
  companyType: CompanyType;
}

export function CommercialTab({ companyType }: CommercialTabProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CompanyFormInput>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condizioni Commerciali</CardTitle>
        <CardDescription>
          {companyType === "CUSTOMER"
            ? "Termini di pagamento e condizioni di vendita"
            : "Condizioni di acquisto dal fornitore"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {companyType === "CUSTOMER" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Fido Commerciale (€)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  {...register("creditLimit", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                <FormFieldError error={errors.creditLimit} />
              </div>
              <div className="space-y-2">
                <Label>Segmento Cliente</Label>
                <Controller
                  name="segment"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="BRONZE">Bronze</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormFieldError error={errors.segment} />
              </div>
              <div className="space-y-2">
                <Label>Priorità</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Bassa</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormFieldError error={errors.priority} />
              </div>
              <div className="space-y-2">
                <Label>Dimensione</Label>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MICRO">Micro</SelectItem>
                        <SelectItem value="SMALL">Piccola</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="LARGE">Grande</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormFieldError error={errors.size} />
              </div>
            </>
          )}

          {companyType === "SUPPLIER" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Termini di Pagamento</Label>
                <Input
                  id="paymentTerms"
                  {...register("paymentTerms")}
                  placeholder="Es: 30 giorni data fattura"
                />
                <FormFieldError error={errors.paymentTerms} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Fido Fornitore (€)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  {...register("creditLimit", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Credito concesso dal fornitore</p>
                <FormFieldError error={errors.creditLimit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">Tempo di Consegna (giorni)</Label>
                <Input
                  id="leadTimeDays"
                  type="number"
                  {...register("leadTimeDays", { valueAsNumber: true })}
                  placeholder="0"
                />
                <FormFieldError error={errors.leadTimeDays} />
              </div>
              <div className="space-y-2">
                <Label>Valutazione (1-5)</Label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(v) => field.onChange(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">⭐ (1)</SelectItem>
                        <SelectItem value="2">⭐⭐ (2)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormFieldError error={errors.rating} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
