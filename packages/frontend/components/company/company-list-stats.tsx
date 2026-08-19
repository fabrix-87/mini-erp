// components/company/company-list-stats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { CustomerStats, SupplierStats } from "@mini-erp/shared";
import { formatCurrency } from "@/utils/format-currency";

type CustomerListStatsProps = {
  type: "CUSTOMER";
  stats: CustomerStats;
};

type SupplierListStatsProps = {
  type: "SUPPLIER";
  stats: SupplierStats;
};

type CompanyListStatsProps = CustomerListStatsProps | SupplierListStatsProps

export function CompanyListStats({ type, stats }: CompanyListStatsProps) {
  if (type === "CUSTOMER" && stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Clienti</p>
                <p className="text-2xl font-bold">{stats.totalCustomers || 0}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</p>
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
                  {formatCurrency(stats.averageOrderValue || 0)}
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
                {stats.bySegment &&
                  Object.entries(stats.bySegment).map(([segment, count]) => (
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

  if (type === "SUPPLIER" && stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Fornitori</p>
                <p className="text-2xl font-bold">{stats.totalSuppliers || 0}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent || 0)}</p>
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
                    {stats.averageRating || "0.0"}
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
                {stats.byRating &&
                  Object.entries(stats.byRating)
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
