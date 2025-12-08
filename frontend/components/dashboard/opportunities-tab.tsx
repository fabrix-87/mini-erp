"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./stat-card"
import { Briefcase, Target, TrendingUp, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OpportunitiesTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function OpportunitiesTab({ dateRange }: OpportunitiesTabProps) {
  // Mock data
  const opportunityStats = {
    totalValue: 450000,
    winRate: 28.5,
    avgDealSize: 10714,
    avgSalesCycle: 45,
  };

  const pipeline = [
    { stage: "LEAD_QUALIFICATION", label: "Qualificazione Lead", value: 50000, count: 8, probability: 10, color: "bg-gray-400" },
    { stage: "PROSPECTING", label: "Prospecting", value: 80000, count: 12, probability: 20, color: "bg-blue-400" },
    { stage: "NEEDS_ANALYSIS", label: "Analisi Bisogni", value: 120000, count: 10, probability: 40, color: "bg-cyan-400" },
    { stage: "PROPOSAL_SENT", label: "Proposta Inviata", value: 100000, count: 8, probability: 60, color: "bg-yellow-400" },
    { stage: "NEGOTIATION", label: "Negoziazione", value: 70000, count: 5, probability: 80, color: "bg-orange-400" },
    { stage: "COMMITMENT", label: "Impegno", value: 30000, count: 2, probability: 90, color: "bg-green-400" },
  ];

  const topPerformers = [
    { id: 1, name: "Mario Rossi", deals: 12, value: 125000, winRate: 35 },
    { id: 2, name: "Laura Bianchi", deals: 10, value: 98000, winRate: 32 },
    { id: 3, name: "Giuseppe Verdi", deals: 8, value: 87000, winRate: 28 },
  ];

  const recentOpportunities = [
    { id: 1, title: "Contratto Enterprise - Acme Corp", value: 25000, stage: "NEGOTIATION", probability: 80 },
    { id: 2, title: "Nuovo Cliente - Tech Solutions", value: 18000, stage: "PROPOSAL_SENT", probability: 60 },
    { id: 3, title: "Espansione - Global Industries", value: 32000, stage: "COMMITMENT", probability: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Opportunity KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Valore Totale Pipeline"
          value={`€${opportunityStats.totalValue.toLocaleString()}`}
          icon={Briefcase}
        />
        <StatCard
          title="Win Rate"
          value={`${opportunityStats.winRate}%`}
          growth={5.2}
          icon={Target}
        />
        <StatCard
          title="Deal Size Medio"
          value={`€${opportunityStats.avgDealSize.toLocaleString()}`}
          growth={8.3}
          icon={TrendingUp}
        />
        <StatCard
          title="Ciclo di Vendita Medio"
          value={`${opportunityStats.avgSalesCycle} giorni`}
          icon={Clock}
        />
      </div>

      {/* Pipeline by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline per Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <span className="font-medium">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {stage.count} opportunità
                    </span>
                    <span className="font-medium">
                      €{stage.value.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="min-w-[60px] justify-center">
                      {stage.probability}%
                    </Badge>
                  </div>
                </div>
                <Progress value={stage.probability} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers & Recent Opportunities */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {performer.deals} deals chiusi
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      €{performer.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Win Rate: {performer.winRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunità in Corso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opp.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stage: {opp.stage.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      €{opp.value.toLocaleString()}
                    </p>
                    <Badge
                      variant={opp.probability > 70 ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {opp.probability}%
                    </Badge>
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