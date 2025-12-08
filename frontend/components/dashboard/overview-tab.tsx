"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign,
  ShoppingCart,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { RecentActivity } from "./recent-activity";

import { OverviewTabProps } from "@/types/dashboard";

export function OverviewTab({ dateRange, data, isLoading }: OverviewTabProps) {
  // Use API data or fallback to empty state
  const sales = data?.sales || { total: 0, count: 0, growth: "0.00" };
  const opportunities = data?.opportunities || {
    total: 0,
    open: 0,
    won: 0,
    lost: 0,
    totalValue: 0,
  };
  const customers = data?.customers || {
    total: 0,
    new: 0,
    qualified: 0,
    closedWon: 0,
  };
  const documents = data?.documents || { total: 0, byType: {} };

  // Calculate growth as number
  const salesGrowth = parseFloat(sales.growth);

  // Calculate document percentages
  const documentTypes = Object.entries(documents.byType).map(
    ([type, count]) => {
      const percentage =
        documents.total > 0
          ? Math.round(((count as number) / documents.total) * 100)
          : 0;
      return { type, count, percentage };
    }
  );

  // Get opportunity percentages
  const totalOpportunities = opportunities.total || 1; // Avoid division by zero
  const opportunityStats = [
    {
      status: "Open",
      count: opportunities.open,
      color: "bg-blue-500",
      percentage: Math.round((opportunities.open / totalOpportunities) * 100),
    },
    {
      status: "Won",
      count: opportunities.won,
      color: "bg-green-500",
      percentage: Math.round((opportunities.won / totalOpportunities) * 100),
    },
    {
      status: "Lost",
      count: opportunities.lost,
      color: "bg-red-500",
      percentage: Math.round((opportunities.lost / totalOpportunities) * 100),
    },
  ];

  // Document type labels (mapping from API to display names)
  const documentTypeLabels: Record<string, string> = {
    INVOICE: "Fatture",
    ORDER: "Ordini",
    QUOTE: "Preventivi",
    DELIVERY_NOTE: "DDT",
    CREDIT_NOTE: "Note di Credito",
    DEBIT_NOTE: "Note di Debito",
    PROFORMA: "Proforma",
    SUPPLIER_ORDER: "Ordini Fornitore",
  };

  const recentActivities = data?.recentActivities || []

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendite Totali"
          value={`€${sales.total.toLocaleString()}`}
          growth={salesGrowth}
          icon={DollarSign}
          description={`${sales.count} ordini`}
        />
        <StatCard
          title="Valore Opportunità"
          value={`€${opportunities.totalValue.toLocaleString()}`}
          icon={Briefcase}
          description={`${opportunities.total} opportunità totali`}
        />
        <StatCard
          title="Clienti Totali"
          value={customers.total.toString()}
          icon={Users}
          description={`${customers.new} nuovi nel periodo`}
        />
        <StatCard
          title="Documenti"
          value={documents.total.toString()}
          icon={FileText}
          description="Totale documenti"
        />
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opportunità Aperte
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.open}</div>
            <p className="text-xs text-muted-foreground">
              Valore: €{opportunities.totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clienti Qualificati
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.qualified}</div>
            <p className="text-xs text-muted-foreground">
              {customers.closedWon} deals chiusi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.total > 0
                ? Math.round((opportunities.won / opportunities.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunities.won} vinte su {opportunities.total}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Documenti per Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {documentTypes.length > 0 ? (
              <div className="space-y-4">
                {documentTypes.map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">
                        {documentTypeLabels[doc.type] || doc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {doc.count as number}
                      </span>
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${doc.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {doc.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nessun documento nel periodo selezionato
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunità per Status</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.total > 0 ? (
              <div className="space-y-4">
                {opportunityStats.map((opp) => (
                  <div key={opp.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${opp.color}`} />
                        <span className="text-sm font-medium">
                          {opp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {opp.count}
                        </span>
                        <span className="text-sm font-medium w-12 text-right">
                          {opp.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${opp.color} transition-all`}
                        style={{ width: `${opp.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nessuna opportunità nel periodo selezionato
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );
}
