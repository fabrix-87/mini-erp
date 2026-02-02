import { MovementType, WarehouseType } from "../constants";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Entity types
export type Warehouse = {
  id: number;
  name: string;
  location?: string;
  type: WarehouseType;

  createdAt: Date;
};

export type StockMovement = {
  id: number;
  productVariantId: number;
  warehouseId: number;
  quantity: number;
  movementType: MovementType;
  referenceId?: string;
  note?: string;
  movementeDate: Date;
};

export type VirtualStock = {
  id: number;
  productVariantId: number;
  warehouseId: number;
  quantity: number;
  updatedAt: Date;

  source?: string; // Provenienza (API, CSV, MANUALE, Etc..)
};
