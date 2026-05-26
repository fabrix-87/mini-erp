// packages/frontend/components/company/tabs/basic-info-tab.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { CompanyFormValues } from "@mini-erp/shared";
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
import { CountryCombobox } from "@/components/ui/country-combobox";
import { FormFieldError } from "@/components/ui/form-field-error";

export function BasicInfoTab() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Generali</CardTitle>
          <CardDescription>Dati identificativi dell'azienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo Entità *</Label>
              <Controller
                name="entityType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JURIDICAL">Persona Giuridica</SelectItem>
                      <SelectItem value="NATURAL">Persona Fisica</SelectItem>
                      <SelectItem value="FOREIGN">Entità Estera</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldError error={errors.entityType} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Attivo</SelectItem>
                      <SelectItem value="INACTIVE">Inattivo</SelectItem>
                      <SelectItem value="SUSPENDED">Sospeso</SelectItem>
                      <SelectItem value="ARCHIVED">Archiviato</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldError error={errors.status} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyName">Ragione Sociale *</Label>
              <Input id="companyName" {...register("companyName")} placeholder="Es: Acme S.r.l." />
              <FormFieldError error={errors.companyName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Commerciale</Label>
              <Input id="tradeName" {...register("tradeName")} placeholder="Es: Acme Store" />
              <FormFieldError error={errors.tradeName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forma Giuridica</Label>
              <Input id="legalForm" {...register("legalForm")} placeholder="Es: S.r.l., S.p.A." />
              <FormFieldError error={errors.legalForm} />
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
              <Label htmlFor="mainEmail">Email Principale</Label>
              <Input
                id="mainEmail"
                type="email"
                {...register("mainEmail")}
                placeholder="info@azienda.it"
              />
              <FormFieldError error={errors.mainEmail} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainPhone">Telefono</Label>
              <Input id="mainPhone" {...register("mainPhone")} placeholder="+39 02 1234567" />
              <FormFieldError error={errors.mainPhone} />
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
            <Label htmlFor="address">Indirizzo</Label>
            <Input id="address" {...register("legalAddress.address")} placeholder="Via Roma 123" />
            <FormFieldError error={errors.legalAddress?.address} />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">CAP</Label>
              <Input id="zipCode" {...register("legalAddress.zipCode")} placeholder="20121" />
              <FormFieldError error={errors.legalAddress?.zipCode} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input id="city" {...register("legalAddress.city")} placeholder="Milano" />
              <FormFieldError error={errors.legalAddress?.city} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinceCode">Provincia</Label>
              <Input
                id="provinceCode"
                {...register("legalAddress.provinceCode")}
                placeholder="MI"
                maxLength={2}
              />
              <FormFieldError error={errors.legalAddress?.provinceCode} />
            </div>
            <div className="space-y-2">
              <Label>Stato *</Label>
              <Controller
                name="legalAddress.countryCode"
                control={control}
                render={({ field }) => (
                  <CountryCombobox value={field.value} onValueChange={field.onChange} />
                )}
              />
              <FormFieldError error={errors.legalAddress?.countryCode} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
