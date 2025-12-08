"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./stat-card";
import { Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProductsTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function ProductsTab({ dateRange }: ProductsTabProps) {
  // Mock data
  const productStats = {
    total: 450,
    active: 420,
    inactive: 30,
    lowStock: 12,
  };

  const lowStockProducts = [
    { id: 1, code: "SHIRT-RED-M", name: "T-Shirt Cotton Red", stock: 5, threshold: 10, deficit: 5 },
    { id: 2, code: "PANTS-BLU-L", name: "Jeans Blue Large", stock: 3, threshold: 15, deficit: 12 },
    { id: 3, code: "SHOE-BLK-42", name: "Sneaker Black 42", stock: 8, threshold: 20, deficit: 12 },
  ];

  const bestSellers = [
    { id: 1, name: "Product XYZ", quantity: 500, revenue: 25000, orders: 120 },
    { id: 2, name: "Product ABC", quantity: 380, revenue: 19000, orders: 95 },
    { id: 3, name: "Product DEF", quantity: 250, revenue: 15000, orders: 78 },
  ];

  const categoryPerformance = [
    { id: 1, name: "Abbigliamento", products: 150, revenue: 45000, orders: 320 },
    { id: 2, name: "Calzature", products: 80, revenue: 32000, orders: 180 },
    { id: 3, name: "Accessori", products: 120, revenue: 28000, orders: 250 },
  ];

  return (
    <div className="space-y-6">
      {/* Product KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Prodotti Totali"
          value={productStats.total.toString()}
          icon={Package}
        />
        <StatCard
          title="Prodotti Attivi"
          value={productStats.active.toString()}
          icon={Package}
        />
        <StatCard
          title="Valore Magazzino"
          value="€450.000"
          icon={Boxes}
        />
        <StatCard
          title="Alert Scorte Basse"
          value={productStats.lowStock.toString()}
          icon={AlertTriangle}
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attenzione: Scorte Basse</AlertTitle>
          <AlertDescription>
            Ci sono {lowStockProducts.length} prodotti con scorte sotto la soglia minima.
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prodotti con Scorte Basse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.code}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Stock: {product.stock} / {product.threshold}
                    </p>
                    <p className="text-xs text-red-500">
                      Deficit: -{product.deficit}
                    </p>
                  </div>
                  <Badge variant="destructive">Urgente</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Sellers & Category Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prodotti Più Venduti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellers.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} unità
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      €{product.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.orders} ordini
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.products} prodotti
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      €{category.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.orders} ordini
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}