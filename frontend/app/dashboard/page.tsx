"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  Briefcase,
  Warehouse,
} from "lucide-react";

// Dashboard Components
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SalesTab } from "@/components/dashboard/sales-tab";
import { OpportunitiesTab } from "@/components/dashboard/opportunities-tab";
import { ProductsTab } from "@/components/dashboard/products-tab";
import { CustomersTab } from "@/components/dashboard/customers-tab";
import { WarehouseTab } from "@/components/dashboard/warehouse-tab";
import { DashboardOverviewWithAPI } from "@/components/dashboard/overview-api";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header con filtri globali */}
      <DashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Vendite</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Opportunità</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Prodotti</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clienti</span>
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="gap-2">
            <Warehouse className="h-4 w-4" />
            <span className="hidden sm:inline">Magazzino</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <Tabs defaultValue="overview">
          <TabsContent value="overview">
            <DashboardOverviewWithAPI dateRange={dateRange} />
          </TabsContent>
        </Tabs>
        <TabsContent value="sales" className="mt-6">
          <SalesTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <OpportunitiesTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductsTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="warehouse" className="mt-6">
          <WarehouseTab dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
