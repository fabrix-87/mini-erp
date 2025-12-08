"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./stat-card";
import { Warehouse, Package, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WarehouseTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function WarehouseTab({ dateRange }: WarehouseTabProps) {
  // Mock data
  const warehouseStats = {
    totalValue: 850000,
    inbound: 1200,
    outbound: 980,
    turnover: 1.45,
  };

  const warehouses = [
    { id: 1, name: "Magazzino Principale", units: 10000, value: 500000, movements: 450 },
    { id: 2, name: "Magazzino Secondario", units: 5000, value: 250000, movements: 230 },
    { id: 3, name: "Magazzino Distributore", units: 3000, value: 100000, movements: 120 },
  ];

  const movementsByType = [
    { type: "SALE", label: "Vendite", quantity: 500, count: 120, color: "bg-red-500" },
    { type: "PURCHASE", label: "Acquisti", quantity: 800, count: 45, color: "bg-green-500" },
    { type: "TRANSFER_IN", label: "Trasferimenti In", quantity: 200, count: 30, color: "bg-blue-500" },
    { type: "TRANSFER_OUT", label: "Trasferimenti Out", quantity: 180, count: 28, color: "bg-orange-500" },
    { type: "ADJUSTMENT", label: "Rettifiche", quantity: 50, count: 15, color: "bg-purple-500" },
  ];

  const recentMovements = [
    { id: 1, type: "SALE", product: "T-Shirt Cotton Red", quantity: -50, warehouse: "Principale", date: "2025-12-07" },
    { id: 2, type: "PURCHASE", product: "Jeans Blue Large", quantity: 100, warehouse: "Principale", date: "2025-12-06" },
    { id: 3, type: "TRANSFER_OUT", product: "Sneaker Black 42", quantity: -30, warehouse: "Secondario", date: "2025-12-06" },
  ];

  const stockDistribution = [
    { category: "Abbigliamento", quantity: 8000, variants: 150 },
    { category: "Calzature", quantity: 5000, variants: 80 },
    { category: "Accessori", quantity: 5000, variants: 120 },
  ];

  return (
    <div className="space-y-6">
      {/* Warehouse KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Valore Totale Stock"
          value={`€${warehouseStats.totalValue.toLocaleString()}`}
          icon={Package}
        />
        <StatCard
          title="Movimenti In Entrata"
          value={warehouseStats.inbound.toString()}
          growth={15.2}
          icon={TrendingUp}
        />
        <StatCard
          title="Movimenti In Uscita"
          value={warehouseStats.outbound.toString()}
          growth={8.5}
          icon={TrendingDown}
        />
        <StatCard
          title="Inventory Turnover"
          value={warehouseStats.turnover.toFixed(2)}
          icon={ArrowRightLeft}
          description="Rotazione magazzino"
        />
      </div>

      {/* Warehouses Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Magazzini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{warehouse.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {warehouse.movements} movimenti
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {warehouse.units.toLocaleString()} unità
                  </p>
                  <p className="text-xs text-muted-foreground">
                    €{warehouse.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Movements by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Movimenti per Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {movementsByType.map((movement) => (
              <div key={movement.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${movement.color}`} />
                    <span className="font-medium">{movement.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {movement.quantity} unità ({movement.count} movimenti)
                  </span>
                </div>
                <Progress value={(movement.quantity / 1000) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements & Stock Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Movimenti Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{movement.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.warehouse} • {movement.date}
                    </p>
                  </div>
                  <Badge
                    variant={movement.quantity > 0 ? "default" : "secondary"}
                  >
                    {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Stock per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockDistribution.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variants} varianti
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {item.quantity.toLocaleString()} unità
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}