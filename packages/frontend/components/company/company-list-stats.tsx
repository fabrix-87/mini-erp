// components/company/company-list-stats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { useCustomerStats, useSupplierStats } from "@/hooks/use-company";
import { CompanyType } from "@/types/company-types";
import { Decimal } from "@mini-erp/shared";

interface CompanyListStatsProps {
  type: CompanyType;
}

export function CompanyListStats({ type }: CompanyListStatsProps) {
  const stats =
    type === "CUSTOMER"
      ? { type: "CUSTOMER" as const, ...useCustomerStats() }
      : { type: "SUPPLIER" as const, ...useSupplierStats() };

  const { isLoading } = stats;

  const formatCurrency = (value: number | Decimal | string | null | undefined): string => {
    const numericValue = Number(value);

    if (value == null || isNaN(numericValue)) return "—";

    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats.type === "CUSTOMER" && stats.data) {
    const data = stats.data;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Clienti</p>
                <p className="text-2xl font-bold">{data.data.totalCustomers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Totale</p>
                <p className="text-2xl font-bold">{formatCurrency(data.data?.totalRevenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valore Medio Ordine</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.data?.averageOrderValue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Per Segmento</p>
              <div className="space-y-1">
                {data.data?.bySegment &&
                  Object.entries(data.data.bySegment).map(([segment, count]) => (
                    <div key={segment} className="flex justify-between text-sm">
                      <span>{segment}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stats.type === "SUPPLIER" && stats.data) {
    const data = stats.data;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Fornitori</p>
                <p className="text-2xl font-bold">{data.data?.totalSuppliers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spesa Totale</p>
                <p className="text-2xl font-bold">{formatCurrency(data.data?.totalSpent || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating Medio</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {data.data?.averageRating || "0.0"}
                  </p>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Per Rating</p>
              <div className="space-y-1">
                {data.data?.byRating &&
                  Object.entries(data.data.byRating)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([rating, count]) => (
                      <div key={rating} className="flex justify-between text-sm">
                        <span>{"⭐".repeat(parseInt(rating))}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
