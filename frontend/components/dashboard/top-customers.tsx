"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

export function TopCustomers() {
  // Mock data - Replace with API call
  const customers = [
    {
      id: 1,
      name: "Acme Corp",
      code: "ACME001",
      revenue: 18000,
      orders: 12,
      segment: "VIP",
      growth: 25,
    },
    {
      id: 2,
      name: "Tech Solutions",
      code: "TECH002",
      revenue: 15000,
      orders: 10,
      segment: "GOLD",
      growth: 18,
    },
    {
      id: 3,
      name: "Global Industries",
      code: "GLOB003",
      revenue: 12000,
      orders: 8,
      segment: "GOLD",
      growth: -5,
    },
    {
      id: 4,
      name: "Innovation Ltd",
      code: "INNO004",
      revenue: 10500,
      orders: 7,
      segment: "SILVER",
      growth: 32,
    },
    {
      id: 5,
      name: "Future Systems",
      code: "FUTU005",
      revenue: 9200,
      orders: 6,
      segment: "SILVER",
      growth: 12,
    },
  ];

  const segmentColors: Record<string, string> = {
    VIP: "bg-purple-100 text-purple-700 border-purple-300",
    GOLD: "bg-yellow-100 text-yellow-700 border-yellow-300",
    SILVER: "bg-gray-100 text-gray-700 border-gray-300",
    BRONZE: "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Clienti per Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-sm font-medium bg-primary/10">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    {index === 0 && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{customer.code}</span>
                    <span>•</span>
                    <span>{customer.orders} ordini</span>
                  </div>
                </div>
              </div>

              {/* Revenue & Segment */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {/* Revenue */}
                <div className="text-right">
                  <p className="text-sm font-medium">
                    €{customer.revenue.toLocaleString()}
                  </p>
                  <p className={`text-xs ${customer.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.growth > 0 ? '+' : ''}{customer.growth}%
                  </p>
                </div>

                {/* Segment Badge */}
                <Badge
                  variant="outline"
                  className={segmentColors[customer.segment]}
                >
                  {customer.segment}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}