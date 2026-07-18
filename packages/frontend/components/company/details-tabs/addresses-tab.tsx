// components/company/tabs/company-addresses-tab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Phone, Star, Edit } from "lucide-react";
import { getAddresses } from "@/lib/client/modules/address";
import { Address } from "@/types/address";

interface CompanyAddressesTabProps {
  companyId: string;
}

export function CompanyAddressesTab({ companyId }: CompanyAddressesTabProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["addresses", companyId],
    queryFn: () => getAddresses(companyId),
  });
  const addresses = data?.data || [];

  const getAddressTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LEGAL: "Legale",
      BILLING: "Fatturazione",
      SHIPPING: "Spedizione",
      OFFICE: "Ufficio",
      WAREHOUSE: "Magazzino",
      OTHER: "Altro",
    };
    return labels[type] || type;
  };

  const getAddressTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      LEGAL: "default",
      BILLING: "secondary",
      SHIPPING: "outline",
      OFFICE: "outline",
      WAREHOUSE: "outline",
      OTHER: "outline",
    };
    return variants[type] || "outline";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indirizzi ({addresses.length})</CardTitle>
        <Button
          size="sm"
          onClick={() =>
            router.push(`/addresses/new?companyId=${companyId}`)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Indirizzo
        </Button>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nessun indirizzo associato
            </p>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/addresses/new?companyId=${companyId}`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi il primo indirizzo
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address: Address) => (
              <Card key={address.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getAddressTypeBadge(address.addressType)}>
                        {getAddressTypeLabel(address.addressType)}
                      </Badge>
                      {address.isPrimary && (
                        <Badge variant="secondary">
                          <Star className="mr-1 h-3 w-3" />
                          Principale
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/addresses/${address.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <p>{address.address}</p>
                        <p>
                          {address.zipCode} {address.city}
                          {address.provinceCode && ` (${address.provinceCode})`}
                        </p>
                        <p className="text-muted-foreground">
                          {address.countryCode}
                        </p>
                      </div>
                    </div>

                    {address.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{address.phone}</p>
                      </div>
                    )}

                    {address.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {address.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}