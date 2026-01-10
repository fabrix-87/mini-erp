"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./stat-card";
import { Users, UserPlus, TrendingUp, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CustomersTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function CustomersTab({ dateRange }: CustomersTabProps) {
  // Mock data
  const customerStats = {
    total: 250,
    new: 15,
    active: 180,
    avgOrderValue: 2500,
  };

  const distribution = {
    byType: [
      { type: "CUSTOMER", count: 200, percentage: 80 },
      { type: "LEAD", count: 30, percentage: 12 },
      { type: "PROSPECT", count: 20, percentage: 8 },
    ],
    bySegment: [
      { segment: "VIP", count: 10, percentage: 4 },
      { segment: "GOLD", count: 50, percentage: 20 },
      { segment: "SILVER", count: 90, percentage: 36 },
      { segment: "BRONZE", count: 100, percentage: 40 },
    ],
    byLifetimeValue: [
      { range: "50K+", count: 10 },
      { range: "10K-50K", count: 30 },
      { range: "5K-10K", count: 40 },
      { range: "1K-5K", count: 70 },
      { range: "0-1K", count: 80 },
      { range: "0", count: 20 },
    ],
  };

  const topCustomers = [
    { id: 1, name: "Acme Corp", lifetime: 125000, period: 18000, orders: 85 },
    { id: 2, name: "Tech Solutions", lifetime: 98000, period: 15000, orders: 62 },
    { id: 3, name: "Global Industries", lifetime: 87000, period: 12000, orders: 54 },
  ];

  const segmentColors: Record<string, string> = {
    VIP: "bg-purple-500",
    GOLD: "bg-yellow-500",
    SILVER: "bg-gray-400",
    BRONZE: "bg-orange-600",
  };

  return (
    <div className="space-y-6">
      {/* Customer KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clienti Totali"
          value={customerStats.total.toString()}
          icon={Users}
        />
        <StatCard
          title="Nuovi Clienti"
          value={customerStats.new.toString()}
          growth={12.5}
          icon={UserPlus}
        />
        <StatCard
          title="Clienti Attivi"
          value={customerStats.active.toString()}
          icon={TrendingUp}
        />
        <StatCard
          title="Valore Medio Ordine"
          value={`€${customerStats.avgOrderValue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione per Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribution.byType.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Segment */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione per Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribution.bySegment.map((item) => (
                <div key={item.segment} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${segmentColors[item.segment]}`} />
                      <span className="font-medium">{item.segment}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifetime Value Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Lifetime Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {distribution.byLifetimeValue.map((item) => (
              <div
                key={item.range}
                className="flex flex-col items-center justify-center p-4 border rounded-lg"
              >
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clienti per Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.orders} ordini totali
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Lifetime: €{customer.lifetime.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Periodo: €{customer.period.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}