// components/company/details-tabs/info-tab.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer-types";
import { Supplier } from "@/types/supplier-types";
import { CompanyType } from "@/types/company";
import {
  Building2,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  Tag,
} from "lucide-react";

interface CompanyInfoTabProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export function CompanyInfoTab({ data, companyType }: CompanyInfoTabProps) {
  const companyData = data.company;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Dati Azienda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dati Azienda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ragione Sociale
              </p>
              <p className="text-sm">{companyData?.companyName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nome Commerciale
              </p>
              <p className="text-sm">{companyData?.tradeName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Forma Giuridica
              </p>
              <p className="text-sm">{companyData?.legalForm || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Codice
              </p>
              <p className="text-sm font-mono">{companyData?.code || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo Entità
              </p>
              <Badge variant="outline">{companyData?.entityType || "N/A"}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stato</p>
              <Badge
                variant={
                  companyData?.status === "ACTIVE" ? "default" : "secondary"
                }
              >
                {companyData?.status || "N/A"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{companyData?.mainEmail || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Telefono
              </p>
              <p className="text-sm">{companyData?.mainPhone || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dati Fiscali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dati Fiscali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Partita IVA
              </p>
              <p className="text-sm font-mono">
                {companyData?.vatNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Codice Fiscale
              </p>
              <p className="text-sm font-mono">
                {companyData?.taxCode || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Codice SDI
              </p>
              <p className="text-sm font-mono">{companyData?.sdiCode || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PEC</p>
              <p className="text-sm">{companyData?.pec || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Codice EORI
              </p>
              <p className="text-sm font-mono">
                {companyData?.eoriNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                VAT ID (UE)
              </p>
              <p className="text-sm font-mono">{companyData?.vatId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nazione Fiscale
              </p>
              <Badge variant="outline">{companyData?.countryCode || "IT"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Specific Info */}
      {companyType === "CUSTOMER" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Classificazione Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <Badge>{(data as Customer).type || "N/A"}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Segmento
                </p>
                <Badge variant="secondary">
                  {(data as Customer).segment || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorità
                </p>
                <Badge
                  variant={
                    (data as Customer).priority === "HIGH"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {(data as Customer).priority || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status Lead
                </p>
                <Badge variant="outline">
                  {(data as Customer).leadStatus || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dimensione
                </p>
                <Badge variant="outline">
                  {(data as Customer).size || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Credit Status
                </p>
                <Badge
                  variant={
                    (data as Customer).creditStatus === "APPROVED"
                      ? "default"
                      : "secondary"
                  }
                >
                  {(data as Customer).creditStatus || "N/A"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Specific Info */}
      {companyType === "SUPPLIER" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Condizioni Fornitore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Termini Pagamento
                </p>
                <p className="text-sm">
                  {(data as Supplier).paymentTerms || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tempo Consegna
                </p>
                <p className="text-sm">
                  {(data as Supplier).leadTimeDays || 0} giorni
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valutazione
                </p>
                <p className="text-sm">
                  {"⭐".repeat((data as Supplier).rating || 0)}{" "}
                  {(data as Supplier).rating}/5
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conto Bancario
                </p>
                <p className="text-sm font-mono">
                  {(data as Supplier).bankAccount || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiche & Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {companyType === "CUSTOMER" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Prima Vendita
                  </p>
                  <p className="text-sm">
                    {formatDate((data as Customer).firstSaleDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ultima Vendita
                  </p>
                  <p className="text-sm">
                    {formatDate((data as Customer).lastSaleDate)}
                  </p>
                </div>
              </>
            )}
            {companyType === "SUPPLIER" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Primo Ordine
                  </p>
                  <p className="text-sm">
                    {formatDate((data as Supplier).firstOrderDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ultimo Ordine
                  </p>
                  <p className="text-sm">
                    {formatDate((data as Supplier).lastOrderDate)}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Creato il
              </p>
              <p className="text-sm">{formatDate(companyData?.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Aggiornato il
              </p>
              <p className="text-sm">{formatDate(companyData?.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {companyData?.customFields && Object.keys(companyData.customFields).length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campi Personalizzati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(companyData.customFields, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}