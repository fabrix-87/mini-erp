// components/company/tabs/commercial-tab.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyFormData, CompanyType } from "@/types/company-types";

interface CommercialTabProps {
  formData: CompanyFormData;
  onChange: (field: keyof CompanyFormData, value: any) => void;
  companyType: CompanyType;
}

export function CommercialTab({ formData, onChange, companyType }: CommercialTabProps) {
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
          {/* Customer specific fields */}
          {companyType === "CUSTOMER" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Fido Commerciale (€)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit || ""}
                  onChange={(e) => onChange("creditLimit", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento Cliente</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(value) => onChange("segment", value)}
                >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorità</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => onChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Bassa</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Dimensione</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => onChange("size", value)}
                >
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
              </div>
            </>
          )}

          {/* Supplier specific fields */}
          {companyType === "SUPPLIER" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Termini di Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms || ""}
                  onChange={(e) => onChange("paymentTerms", e.target.value)}
                  placeholder="Es: 30 giorni data fattura"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Fido Fornitore (€)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit || ""}
                  onChange={(e) => onChange("creditLimit", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Credito concesso dal fornitore
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">Tempo di Consegna (giorni)</Label>
                <Input
                  id="leadTimeDays"
                  type="number"
                  value={formData.leadTimeDays || 0}
                  onChange={(e) => onChange("leadTimeDays", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Valutazione (1-5)</Label>
                <Select
                  value={formData.rating?.toString()}
                  onValueChange={(value) => onChange("rating", parseInt(value))}
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
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}