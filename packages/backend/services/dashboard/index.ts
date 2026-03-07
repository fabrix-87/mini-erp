// ============================================================================
// DASHBOARD SERVICES - MAIN EXPORT
// ============================================================================

// Leads
export {
  fetchLeadsKPI,
  fetchLeadsFunnel,
  fetchLeadsFollowUp,
  fetchLeadsSourceDistribution,
} from "./leads-widget";

// Opportunities
export {
  fetchOpportunitiesKPI,
  fetchOpportunitiesPipeline,
  fetchOpportunitiesForecast,
} from "./opportunities-widget";

// Activities
export {
  fetchActivitiesFeed,
  fetchActivitiesKPI,
  fetchActivitiesByType,
} from "./activities-widget";

// Customers
export {
  fetchCustomersKPI,
  fetchTopCustomers,
  fetchCustomerLifecycle,
} from "./customers-widget";

// Revenue
export {
  fetchRevenueKPI,
  fetchInvoicesStatus,
  fetchOverdueInstallments,
  fetchRevenueTrend,
} from "./revenue-widget";

// Purchase
export {
  fetchSupplierOrdersKPI,
  fetchPurchaseTrend,
} from "./purchase-widget";

// Financial Health
export {
  fetchCashFlow,
  fetchProfitMargin,
  fetchAccountsPayable,
  fetchAccountsReceivable,
} from "./financial-health-widget";

// Documents
export {
  fetchRecentDocuments,
  fetchDocumentsKPI,
  fetchDocumentsByType,
  fetchExpiringQuotes,
} from "./documents-widget";

// Logistics
export {
  fetchDeliveriesKPI,
  fetchStockAlerts,
  fetchDocumentsFulfillment,
  fetchDeliveryPerformance,
} from "./logistics-widget";

// Stock
export {
  fetchStockValue,
  fetchStockMovements,
} from "./stock-widget";

// Products
export {
  fetchProductsKPI,
  fetchTopSellingProducts,
  fetchProductsByCategory,
  fetchProductsPerformance,
} from "./products-widget";

// Team
export { fetchTeamPerformance } from "./team-widget";

// Alerts
export { fetchAlerts } from "./alerts-widget";
