// ============================================================================
// DASHBOARD CONTROLLER - Main Export
// ============================================================================

// Overview
export { getDashboardOverview } from './dashboard/overview';

// Sales
export { getSalesStatistics } from './dashboard/sales';

// Opportunities
export { getOpportunityStatistics } from './dashboard/opportunity';

// Products
export { 
  getProductStatistics 
} from './dashboard/product';

// Customers
export { 
  getCustomerStatistics 
} from './dashboard/customer';

// Documents
export { 
  getDocumentStatistics 
} from './dashboard/document';

// Financial
export { 
  getFinancialStatistics 
} from './dashboard/financial';

// Warehouse
export { 
  getWarehouseStatistics 
} from './dashboard/warehouse';

// Supplier

export {
  getSupplierStatistics,
  getSupplierAdvancedStatistics,
  getSupplierOrderTrends,
  compareSuppliers  
} from './dashboard/supplier'