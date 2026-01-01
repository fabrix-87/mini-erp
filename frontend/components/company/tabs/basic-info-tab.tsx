// components/company/tabs/basic-info-tab.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CompanyFormData, CompanyType } from "@/types/company";
import { CountryCombobox } from "@/components/ui/country-combobox";

interface BasicInfoTabProps {
  formData: CompanyFormData;
  onChange: (field: keyof CompanyFormData, value: any) => void;
  onNestedChange: (parent: string, field: string, value: any) => void;
  companyType: CompanyType;
}

export function BasicInfoTab({
  formData,
  onChange,
  onNestedChange,
  companyType,
}: BasicInfoTabProps) {
  return (
    <>
      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Generali</CardTitle>
          <CardDescription>Dati identificativi dell'azienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo Entità *</Label>
              <Select
                value={formData.entityType}
                onValueChange={(value) => onChange("entityType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JURIDICAL">Persona Giuridica</SelectItem>
                  <SelectItem value="NATURAL">Persona Fisica</SelectItem>
                  <SelectItem value="FOREIGN">Entità Estera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onChange("status", value)}
              >
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
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyName">Ragione Sociale *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => onChange("companyName", e.target.value)}
                required
                placeholder="Es: Acme S.r.l."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Commerciale</Label>
              <Input
                id="tradeName"
                value={formData.tradeName || ""}
                onChange={(e) => onChange("tradeName", e.target.value)}
                placeholder="Es: Acme Store"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forma Giuridica</Label>
              <Input
                id="legalForm"
                value={formData.legalForm || ""}
                onChange={(e) => onChange("legalForm", e.target.value)}
                placeholder="Es: S.r.l., S.p.A."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
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
                value={formData.mainEmail || ""}
                onChange={(e) => onChange("mainEmail", e.target.value)}
                placeholder="info@azienda.it"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainPhone">Telefono</Label>
              <Input
                id="mainPhone"
                value={formData.mainPhone || ""}
                onChange={(e) => onChange("mainPhone", e.target.value)}
                placeholder="+39 02 1234567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Address */}
      <Card>
        <CardHeader>
          <CardTitle>Sede Legale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input
              id="address"
              value={formData.legalAddress?.address || ""}
              onChange={(e) =>
                onNestedChange("legalAddress", "address", e.target.value)
              }
              placeholder="Via Roma 123"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">CAP</Label>
              <Input
                id="zipCode"
                value={formData.legalAddress?.zipCode || ""}
                onChange={(e) =>
                  onNestedChange("legalAddress", "zipCode", e.target.value)
                }
                placeholder="20121"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                value={formData.legalAddress?.city || ""}
                onChange={(e) =>
                  onNestedChange("legalAddress", "city", e.target.value)
                }
                placeholder="Milano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provinceCode">Provincia</Label>
              <Input
                id="provinceCode"
                value={formData.legalAddress?.provinceCode || ""}
                onChange={(e) =>
                  onNestedChange("legalAddress", "provinceCode", e.target.value)
                }
                placeholder="MI"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Stato *</Label>
              <CountryCombobox
                value={formData.legalAddress?.countryCode || ""}
                onValueChange={(value) =>
                  onNestedChange("legalAddress", "countryCode", value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
