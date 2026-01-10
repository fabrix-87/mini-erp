"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "./stat-card";
import { SalesChart } from "./sales-chart";
import { TopProducts } from "./top-products";
import { TopCustomers } from "./top-customers";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";

interface SalesTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function SalesTab({ dateRange }: SalesTabProps) {
  // Mock data
  const salesStats = {
    revenue: { value: 125000, growth: 15.3 },
    tax: { value: 27500, growth: 15.3 },
    paid: { value: 98000, growth: 18.2 },
    average: { value: 504, growth: 6.7 },
  };

  return (
    <div className="space-y-6">
      {/* Sales KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue Totale"
          value={`€${salesStats.revenue.value.toLocaleString()}`}
          growth={salesStats.revenue.growth}
          icon={DollarSign}
        />
        <StatCard
          title="IVA"
          value={`€${salesStats.tax.value.toLocaleString()}`}
          growth={salesStats.tax.growth}
          icon={Receipt}
        />
        <StatCard
          title="Incassato"
          value={`€${salesStats.paid.value.toLocaleString()}`}
          growth={salesStats.paid.growth}
          icon={CreditCard}
        />
        <StatCard
          title="Valore Medio Ordine"
          value={`€${salesStats.average.value.toLocaleString()}`}
          growth={salesStats.average.growth}
          icon={TrendingUp}
        />
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trend Vendite</CardTitle>
            <Tabs defaultValue="day" className="w-auto">
              <TabsList>
                <TabsTrigger value="day">Giorno</TabsTrigger>
                <TabsTrigger value="week">Settimana</TabsTrigger>
                <TabsTrigger value="month">Mese</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <SalesChart />
        </CardContent>
      </Card>

      {/* Top Products & Customers */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopProducts />
        <TopCustomers />
      </div>
    </div>
  );
}