// components/company/tabs/fiscal-data-tab.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyFormData } from "@/types/company";

interface FiscalDataTabProps {
  formData: CompanyFormData;
  onChange: (field: keyof CompanyFormData, value: any) => void;
}

export function FiscalDataTab({ formData, onChange }: FiscalDataTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Fiscali</CardTitle>
        <CardDescription>
          Informazioni per fatturazione e adempimenti fiscali
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Italian Tax Data */}
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Partita IVA</Label>
            <Input
              id="vatNumber"
              value={formData.vatNumber || ""}
              onChange={(e) => onChange("vatNumber", e.target.value)}
              placeholder="IT12345678901"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxCode">Codice Fiscale</Label>
            <Input
              id="taxCode"
              value={formData.taxCode || ""}
              onChange={(e) => onChange("taxCode", e.target.value)}
              placeholder="12345678901"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sdiCode">Codice SDI</Label>
            <Input
              id="sdiCode"
              value={formData.sdiCode || ""}
              onChange={(e) => onChange("sdiCode", e.target.value)}
              placeholder="ABCDEFG"
              maxLength={7}
            />
            <p className="text-xs text-muted-foreground">
              Codice destinatario per fatturazione elettronica
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pec">PEC</Label>
            <Input
              id="pec"
              type="email"
              value={formData.pec || ""}
              onChange={(e) => onChange("pec", e.target.value)}
              placeholder="azienda@pec.it"
            />
          </div>

          {/* Foreign Tax Data */}
          <div className="space-y-2">
            <Label htmlFor="eoriNumber">EORI Number</Label>
            <Input
              id="eoriNumber"
              value={formData.eoriNumber || ""}
              onChange={(e) => onChange("eoriNumber", e.target.value)}
              placeholder="IT123456789000"
            />
            <p className="text-xs text-muted-foreground">
              Per transazioni extra UE
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatId">VAT ID (UE)</Label>
            <Input
              id="vatId"
              value={formData.vatId || ""}
              onChange={(e) => onChange("vatId", e.target.value)}
              placeholder="FR12345678901"
            />
            <p className="text-xs text-muted-foreground">
              Per clienti/fornitori UE
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Nazione Fiscale</Label>
            <Input
              id="countryCode"
              value={formData.countryCode}
              onChange={(e) => onChange("countryCode", e.target.value)}
              placeholder="IT"
              maxLength={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}