// components/company/tabs/classification-tab.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyFormData, CompanyType } from "@/types/company";

interface ClassificationTabProps {
  formData: CompanyFormData;
  onChange: (field: keyof CompanyFormData, value: any) => void;
  companyType: CompanyType;
}

export function ClassificationTab({ formData, onChange, companyType }: ClassificationTabProps) {
  return (
    <>
      {/* Customer Classification */}
      {companyType === "CUSTOMER" && (
        <Card>
          <CardHeader>
            <CardTitle>Classificazione Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo Cliente</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => onChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAD">Lead</SelectItem>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                    <SelectItem value="PARTNER">Partner</SelectItem>
                    <SelectItem value="OTHER">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadStatus">Status Lead</Label>
                <Select
                  value={formData.leadStatus}
                  onValueChange={(value) => onChange("leadStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Nuovo</SelectItem>
                    <SelectItem value="CONTACTED">Contattato</SelectItem>
                    <SelectItem value="QUALIFIED">Qualificato</SelectItem>
                    <SelectItem value="PROPOSAL">Proposta</SelectItem>
                    <SelectItem value="NEGOTIATION">Negoziazione</SelectItem>
                    <SelectItem value="CLOSED_WON">Chiuso Vinto</SelectItem>
                    <SelectItem value="CLOSED_LOST">Chiuso Perso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditStatus">Status Credit Check</Label>
                <Select
                  value={formData.creditStatus}
                  onValueChange={(value) => onChange("creditStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">In Attesa</SelectItem>
                    <SelectItem value="APPROVED">Approvato</SelectItem>
                    <SelectItem value="REJECTED">Rifiutato</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Corso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Note e Informazioni Aggiuntive</CardTitle>
          <CardDescription>
            Descrizioni e note interne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customFields">Campi Personalizzati (JSON)</Label>
            <Textarea
              id="customFields"
              value={typeof formData.customFields === 'string' 
                ? formData.customFields 
                : JSON.stringify(formData.customFields || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange("customFields", parsed);
                } catch {
                  onChange("customFields", e.target.value);
                }
              }}
              placeholder='{"note": "valore", "campo": "altro valore"}'
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Inserisci dati in formato JSON valido
            </p>
          </div>

          {companyType === "SUPPLIER" && (
            <div className="space-y-2">
              <Label>Statistiche</Label>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Ordini Totali</div>
                  <div className="text-2xl font-bold">{formData.totalOrders || 0}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Spesa Totale</div>
                  <div className="text-2xl font-bold">
                    €{(formData.totalSpent || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Valutazione</div>
                  <div className="text-2xl font-bold">
                    {'⭐'.repeat(formData.rating || 0)} ({formData.rating || 0}/5)
                  </div>
                </div>
              </div>
            </div>
          )}

          {companyType === "CUSTOMER" && (
            <div className="space-y-2">
              <Label>Statistiche Vendite</Label>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Vendite Totali</div>
                  <div className="text-2xl font-bold">{formData.totalSales || 0}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Revenue Totale</div>
                  <div className="text-2xl font-bold">
                    €{parseFloat(formData.totalRevenue || "0").toFixed(2)}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Segmento</div>
                  <div className="text-2xl font-bold">{formData.segment || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}