// components/company/company-detail-header.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  TrendingUp,
  CreditCard,
  Star,
  MapPin,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";
import { CompanyType } from "@/types/company";

interface CompanyDetailHeaderProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export function CompanyDetailHeader({
  data,
  companyType,
}: CompanyDetailHeaderProps) {
  const companyData = data;

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      INACTIVE: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
      SUSPENDED: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      ARCHIVED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    };

    return (
      <Badge variant="outline" className={statusColors[companyData?.status || "ACTIVE"]}>
        {companyData?.status || "ACTIVE"}
      </Badge>
    );
  };

  const getTypeInfo = () => {
    if (companyType === "CUSTOMER") {
      const customer = data as Customer;
      return {
        icon: <Building2 className="h-4 w-4" />,
        label: customer.type || "LEAD",
        badges: [
          { label: customer.segment || "STANDARD", variant: "secondary" as const },
          { label: customer.priority || "MEDIUM", variant: "outline" as const },
        ],
      };
    } else {
      const supplier = data as Supplier;
      return {
        icon: <Star className="h-4 w-4" />,
        label: "Fornitore",
        badges: [
          {
            label: `${supplier.rating || 0}/5 ⭐`,
            variant: "secondary" as const,
          },
        ],
      };
    }
  };

  const typeInfo = getTypeInfo();

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return "€0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Status & Type */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          {typeInfo.icon}
          <span>Stato & Tipo</span>
        </div>
        <div className="flex flex-col gap-2">
          {getStatusBadge()}
          <Badge variant="outline">{typeInfo.label}</Badge>
          {typeInfo.badges.map((badge, i) => (
            <Badge key={i} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Mail className="h-4 w-4" />
          <span>Contatti</span>
        </div>
        <div className="space-y-2">
          {companyData?.mainEmail && (
            <div className="flex items-start gap-2">
              <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
              <p className="text-sm truncate">{companyData.mainEmail}</p>
            </div>
          )}
          {companyData?.mainPhone && (
            <div className="flex items-start gap-2">
              <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
              <p className="text-sm">{companyData.mainPhone}</p>
            </div>
          )}
          {companyData?.legalAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {companyData.legalAddress.city}, {companyData.legalAddress.provinceCode}
              </p>
            </div>
          )}
          {!companyData?.mainEmail && !companyData?.mainPhone && (
            <p className="text-sm text-muted-foreground">Non disponibile</p>
          )}
        </div>
      </Card>

      {/* Financial Info - Customer */}
      {companyType === "CUSTOMER" && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <TrendingUp className="h-4 w-4" />
              <span>Vendite</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">
                  {(data as Customer).totalSales || 0}
                </p>
                <p className="text-xs text-muted-foreground">Ordini totali</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {formatCurrency((data as Customer).totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">Revenue totale</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <CreditCard className="h-4 w-4" />
              <span>Credito</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-lg font-semibold">
                  {formatCurrency((data as Customer).creditLimit)}
                </p>
                <p className="text-xs text-muted-foreground">Fido disponibile</p>
              </div>
              <Badge
                variant="outline"
                className={
                  (data as Customer).creditStatus === "APPROVED"
                    ? "bg-green-500/10 text-green-700 border-green-500/20"
                    : "bg-orange-500/10 text-orange-700 border-orange-500/20"
                }
              >
                {(data as Customer).creditStatus || "PENDING"}
              </Badge>
            </div>
          </Card>
        </>
      )}

      {/* Financial Info - Supplier */}
      {companyType === "SUPPLIER" && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <ShoppingCart className="h-4 w-4" />
              <span>Acquisti</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">
                  {(data as Supplier).totalOrders || 0}
                </p>
                <p className="text-xs text-muted-foreground">Ordini totali</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {formatCurrency((data as Supplier).totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground">Spesa totale</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <DollarSign className="h-4 w-4" />
              <span>Condizioni</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-lg font-semibold">
                  {(data as Supplier).leadTimeDays || 0} giorni
                </p>
                <p className="text-xs text-muted-foreground">Tempo consegna</p>
              </div>
              <div>
                <p className="text-sm">
                  {(data as Supplier).paymentTerms || "Non specificato"}
                </p>
                <p className="text-xs text-muted-foreground">Termini pagamento</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}