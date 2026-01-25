import { ActivityDashboardStats } from "./activitiy";
import { CompanyDashboardStats } from "./company";
import { OpportunityDashboardStats } from "./opportunity";

export type PeriodStats = [
  "today",
  "yesterday",
  "last7days",
  "last30days",
  "last90days",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "lastMonth",
  "thisQuarter",
  "lastQuarter",
  "thisYear",
  "lastYear",
  "custom"
];

export interface DashboardStats {
  companies: CompanyDashboardStats;
  opportunities: OpportunityDashboardStats;
  activities: ActivityDashboardStats;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
    ytd: number;
  };
}

export interface DataRangeProps {
  startDate: Date;
  endDate: Date;
}

export interface OverviewTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  data?: OverviewData;
  isLoading?: boolean;
}

export interface RecentActivityType {
  id: number;
  documentNumber: string;
  documentType: string;
  status: string;
  documentDate: Date;
  totalAmount: string;
  customerName: string;
}

export interface OverviewData {
  period: {
    startDate: Date;
    endDate: Date;
    period: PeriodStats;
  };
  sales: {
    total: number;
    count: number;
    growth: string;
    comparison: {
      current: number;
      previous: number;
    }    
  };
  opportunities: {
    total: number;
    open: number;
    won: number;
    lost: number;
    totalValue: number;
    weightedValue: number;
  };
  customers: {
    total: number;
    new: number;
    qualified: number;
    closedWon: number;
  };
  documents: {
    total: number;
    byType: {};
  };
  recentActivities: RecentActivityType[]
}

export interface DocumentDashboardStats {
  totalDrafts: number;
  totalPending: number;
  totalSent: number;
  totalPaid: number;
  totalOverdue: number;
  thisMonthRevenue: number;
  upaindInvoices: number;
}

/*
interface RecentActivity {
  id: number
  type: string
  subject: string
  companyName: string
  scheduledDate: string
  status: string
}

interface TopOpportunity {
  id: number
  name: string
  companyName: string
  estimatedValue: number
  probability: number
  stage: string
}
*/
const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

const stageLabels: Record<string, string> = {
  prospecting: "Prospecting",
  qualification: "Qualificazione",
  proposal: "Proposta",
  negotiation: "Negoziazione",
  closed_won: "Vinto",
  closed_lost: "Perso",
};

export { COLORS, stageLabels };
