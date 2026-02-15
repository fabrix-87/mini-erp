// ============================================================================
// WAREHOUSE TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { ProductVariant } from "./product";
import type { Document, DocumentLine } from "./document";
import type { Supplier } from "./supplier";
import type { User } from "./user";
import type { Currency } from "./currency";
import Decimal from "decimal.js";
import {
  warehouseTypeSchema,
  movementTypeSchema,
  movementStatusSchema,
  virtualSyncStatusSchema,
  stockBatchStatusSchema,
  stockReservationStatusSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  createStockMovementSchema,
  updateStockMovementSchema,
  confirmStockMovementSchema,
  cancelStockMovementSchema,
  bulkConfirmMovementsSchema,
  createVirtualStockSchema,
  updateVirtualStockSchema,
  syncVirtualStockSchema,
  markSyncErrorSchema,
  createStockBatchSchema,
  updateStockBatchSchema,
  adjustBatchQuantitySchema,
  createStockReservationSchema,
  fulfillReservationSchema,
  cancelReservationSchema,
  extendReservationSchema,
  warehouseQuerySchema,
  stockMovementQuerySchema,
  virtualStockQuerySchema,
  stockBatchQuerySchema,
  stockReservationQuerySchema,
  warehouseIdParamSchema,
  stockMovementIdParamSchema,
  virtualStockIdParamSchema,
  stockBatchIdParamSchema,
  stockReservationIdParamSchema,
  stockLevelQuerySchema,
  stockValuationQuerySchema,
  stockMovementReportSchema,
} from "../validators/warehouse";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type WarehouseType = z.infer<typeof warehouseTypeSchema>;
export type MovementType = z.infer<typeof movementTypeSchema>;
export type MovementStatus = z.infer<typeof movementStatusSchema>;
export type VirtualSyncStatus = z.infer<typeof virtualSyncStatusSchema>;
export type StockBatchStatus = z.infer<typeof stockBatchStatusSchema>;
export type StockReservationStatus = z.infer<typeof stockReservationStatusSchema>;

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Warehouse entity
 */
export type Warehouse = {
  id: number;
  name: string;
  location: string | null;
  type: WarehouseType;
  stockMovements: StockMovement[];
  virtualStocks: VirtualStock[];
  documentLines: DocumentLine[];
  stockReservations: StockReservation[];
  documents: Document[];
  createdAt: Date;
};

/**
 * Stock Movement entity
 */
export type StockMovement = Omit<CreateStockMovementInput, "movementDate"> & {
  id: number;
  productVariant: ProductVariant;
  warehouse: Warehouse;
  document?: Document | null;
  documentLine?: DocumentLine | null;
  createdBy?: User | null;
  movementDate: Date;
  createdAt: Date;
};

/**
 * Virtual Stock entity
 */
export type VirtualStock = Omit<CreateVirtualStockInput, "warehouseId"> & {
  id: number;
  productVariant: ProductVariant;
  warehouse: Warehouse;
  supplierCurrency?: Currency | null;
  lastSyncAt: Date | null;
  syncStatus: VirtualSyncStatus;
  syncError: string | null;
  updatedAt: Date;
};

/**
 * Stock Batch entity
 */
export type StockBatch = {
  id: number;
  productVariantId: number;
  productVariant: ProductVariant;
  batchNumber: string;
  manufacturedDate: Date | null;
  expiryDate: Date | null;
  supplierId: number | null;
  supplier?: Supplier | null;
  quantity: number;
  reserved: number;
  status: string;
};

/**
 * Stock Reservation entity
 */
export type StockReservation = {
  id: number;
  productVariantId: number;
  productVariant: ProductVariant;
  warehouseId: number;
  warehouse: Warehouse;
  quantity: number;
  documentId: number;
  document: Document;
  documentLineId: number | null;
  documentLine?: DocumentLine | null;
  status: string;
  reservedAt: Date;
  expiresAt: Date | null;
  fulfilledAt: Date | null;
  cancelledAt: Date | null;
  batchNumber: string | null;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type UpdateStockMovementInput = z.infer<typeof updateStockMovementSchema>;
export type ConfirmStockMovementInput = z.infer<typeof confirmStockMovementSchema>;
export type CancelStockMovementInput = z.infer<typeof cancelStockMovementSchema>;
export type BulkConfirmMovementsInput = z.infer<typeof bulkConfirmMovementsSchema>;

export type CreateVirtualStockInput = z.infer<typeof createVirtualStockSchema>;
export type UpdateVirtualStockInput = z.infer<typeof updateVirtualStockSchema>;
export type SyncVirtualStockInput = z.infer<typeof syncVirtualStockSchema>;
export type MarkSyncErrorInput = z.infer<typeof markSyncErrorSchema>;

export type CreateStockBatchInput = z.infer<typeof createStockBatchSchema>;
export type UpdateStockBatchInput = z.infer<typeof updateStockBatchSchema>;
export type AdjustBatchQuantityInput = z.infer<typeof adjustBatchQuantitySchema>;

export type CreateStockReservationInput = z.infer<typeof createStockReservationSchema>;
export type FulfillReservationInput = z.infer<typeof fulfillReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type ExtendReservationInput = z.infer<typeof extendReservationSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type WarehouseQueryInput = z.infer<typeof warehouseQuerySchema>;
export type StockMovementQueryInput = z.infer<typeof stockMovementQuerySchema>;
export type VirtualStockQueryInput = z.infer<typeof virtualStockQuerySchema>;
export type StockBatchQueryInput = z.infer<typeof stockBatchQuerySchema>;
export type StockReservationQueryInput = z.infer<typeof stockReservationQuerySchema>;
export type StockLevelQueryInput = z.infer<typeof stockLevelQuerySchema>;
export type StockValuationQueryInput = z.infer<typeof stockValuationQuerySchema>;
export type StockMovementReportInput = z.infer<typeof stockMovementReportSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type WarehouseIdParam = z.infer<typeof warehouseIdParamSchema>;
export type StockMovementIdParam = z.infer<typeof stockMovementIdParamSchema>;
export type VirtualStockIdParam = z.infer<typeof virtualStockIdParamSchema>;
export type StockBatchIdParam = z.infer<typeof stockBatchIdParamSchema>;
export type StockReservationIdParam = z.infer<typeof stockReservationIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Stock level summary for a product variant in a warehouse
 */
export interface StockLevel {
  productVariantId: number;
  productVariantSku: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  availableQuantity: number; // totalQuantity - reserved
  reservedQuantity: number;
  incomingQuantity: number; // pending purchase orders
  outgoingQuantity: number; // pending sales orders
  virtualQuantity: number; // from virtual stock
  reorderLevel: number;
  reorderQuantity: number;
  status: "OUT_OF_STOCK" | "CRITICAL" | "LOW" | "WARNING" | "ADEQUATE" | "OVERSTOCKED";
  lastMovementDate: Date | null;
}

/**
 * Stock valuation
 */
export interface StockValuation {
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  totalValue: Decimal;
  averageCost: Decimal;
  byProduct: {
    productVariantId: number;
    productVariantSku: string;
    productName: string;
    quantity: number;
    averageCost: Decimal;
    totalValue: Decimal;
  }[];
  valuationDate: Date;
}

/**
 * Stock movement summary
 */
export interface StockMovementSummary {
  period: {
    from: Date;
    to: Date;
  };
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  netChange: number;
  byMovementType: Record<MovementType, number>;
  byWarehouse: {
    warehouseId: number;
    warehouseName: string;
    totalMovements: number;
    totalIn: number;
    totalOut: number;
  }[];
  topProducts: {
    productVariantId: number;
    productVariantSku: string;
    productName: string;
    totalMovements: number;
    quantity: number;
  }[];
}

/**
 * Warehouse statistics
 */
export interface WarehouseStats {
  warehouseId: number;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: Decimal;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringBatches: number; // expiring in next 30 days
  totalMovementsToday: number;
  totalMovementsThisWeek: number;
  totalMovementsThisMonth: number;
  lastMovementDate: Date | null;
}

/**
 * Stock alert
 */
export interface StockAlert {
  id: string;
  type: "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRING_BATCH" | "EXPIRED_BATCH" | "NEGATIVE_STOCK";
  severity: "critical" | "warning" | "info";
  productVariantId: number;
  productVariantSku: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentQuantity: number;
  reorderLevel?: number;
  batchNumber?: string;
  expiryDate?: Date;
  message: string;
  createdAt: Date;
}

/**
 * Batch expiry report
 */
export interface BatchExpiryReport {
  expired: {
    batchId: number;
    batchNumber: string;
    productVariantId: number;
    productName: string;
    expiryDate: Date;
    quantity: number;
    daysExpired: number;
  }[];
  expiringSoon: {
    batchId: number;
    batchNumber: string;
    productVariantId: number;
    productName: string;
    expiryDate: Date;
    quantity: number;
    daysUntilExpiry: number;
  }[];
  totalExpiredValue: Decimal;
  totalExpiringSoonValue: Decimal;
}

/**
 * Stock transfer request
 */
export interface StockTransferRequest {
  id: number;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  productVariantId: number;
  productName: string;
  quantity: number;
  requestedBy: number;
  requestedAt: Date;
  approvedBy?: number;
  approvedAt?: Date;
  status: "PENDING" | "APPROVED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  transferOutMovementId?: number;
  transferInMovementId?: number;
  notes: string | null;
}

/**
 * Stock inventory snapshot
 */
export interface StockInventorySnapshot {
  snapshotDate: Date;
  warehouseId: number;
  warehouseName: string;
  items: {
    productVariantId: number;
    productVariantSku: string;
    productName: string;
    expectedQuantity: number; // From system
    countedQuantity: number; // Physical count
    difference: number;
    differencePercentage: number;
    unitCost: Decimal;
    differenceValue: Decimal;
  }[];
  totalItems: number;
  itemsWithDifference: number;
  totalDifferenceValue: Decimal;
  accuracyRate: number; // percentage
}

/**
 * Virtual stock sync log
 */
export interface VirtualStockSyncLog {
  id: string;
  virtualStockId: number;
  productVariantId: number;
  warehouseId: number;
  syncStarted: Date;
  syncCompleted: Date | null;
  status: VirtualSyncStatus;
  previousQuantity: number;
  newQuantity: number;
  error: string | null;
  attempts: number;
  source: string | null;
}

/**
 * Stock reservation summary
 */
export interface StockReservationSummary {
  totalReservations: number;
  totalQuantityReserved: number;
  activeReservations: number;
  expiredReservations: number;
  fulfilledReservations: number;
  cancelledReservations: number;
  byWarehouse: {
    warehouseId: number;
    warehouseName: string;
    reservationsCount: number;
    quantityReserved: number;
  }[];
  expiringWithin1Hour: number;
  expiringWithin24Hours: number;
}

/**
 * ABC analysis result (inventory classification)
 */
export interface ABCAnalysisResult {
  productVariantId: number;
  productVariantSku: string;
  productName: string;
  annualSales: Decimal;
  percentageOfTotalSales: number;
  cumulativePercentage: number;
  classification: "A" | "B" | "C"; // A: 80%, B: 15%, C: 5%
  recommendedStockLevel: number;
  currentStockLevel: number;
}
