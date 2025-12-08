"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp } from "lucide-react";

export function TopProducts() {
  // Mock data - Replace with API call
  const products = [
    {
      id: 1,
      name: "Product XYZ",
      reference: "PRD-001",
      quantity: 500,
      revenue: 25000,
      orders: 120,
      trend: "up",
    },
    {
      id: 2,
      name: "Product ABC",
      reference: "PRD-002",
      quantity: 380,
      revenue: 19000,
      orders: 95,
      trend: "up",
    },
    {
      id: 3,
      name: "Product DEF",
      reference: "PRD-003",
      quantity: 250,
      revenue: 15000,
      orders: 78,
      trend: "down",
    },
    {
      id: 4,
      name: "Product GHI",
      reference: "PRD-004",
      quantity: 220,
      revenue: 13500,
      orders: 65,
      trend: "up",
    },
    {
      id: 5,
      name: "Product JKL",
      reference: "PRD-005",
      quantity: 180,
      revenue: 11000,
      orders: 52,
      trend: "up",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top Prodotti per Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Rank Badge */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{product.reference}</span>
                    <span>•</span>
                    <span>{product.quantity} unità</span>
                  </div>
                </div>
              </div>

              {/* Revenue & Orders */}
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-medium">
                  €{product.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.orders} ordini
                </p>
              </div>

              {/* Trend Indicator */}
              <div className="ml-2 shrink-0">
                {product.trend === "up" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <TrendingUp className="h-3 w-3" />
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <TrendingUp className="h-3 w-3 rotate-180" />
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}