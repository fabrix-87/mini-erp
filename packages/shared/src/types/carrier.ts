// ============================================================================
// CARRIER TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Supplier } from "./supplier";
import type { User } from "./user";
import {
  carrierIdParamSchema,
  carrierQuerySchema,
  createCarrierSchema,
  setProductCarriersSchema,
  toggleCarrierActiveSchema,
  updateCarrierSchema,
} from "../validators/carrier";

// ENTITY TYPES

/** Shipping carrier configured by a tenant. */
export type Carrier = {
  id: string;
  code: string;
  name: string;
  supplierId: string | null;
  supplier?: Supplier | null;
  trackingUrlTemplate: string | null;
  active: boolean;
  position: number;
  customFields: Record<string, unknown> | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  deletedByUser?: User | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Slim carrier for selects and document forms. */
export type CarrierListItem = Pick<
  Carrier,
  "id" | "code" | "name" | "active" | "position" | "trackingUrlTemplate"
>;

// INPUT TYPES
export type CreateCarrierInput = z.infer<typeof createCarrierSchema>;
export type CreateCarrierFormValues = z.input<typeof createCarrierSchema>;
export type UpdateCarrierInput = z.infer<typeof updateCarrierSchema>;
export type UpdateCarrierFormValues = z.input<typeof updateCarrierSchema>;
export type ToggleCarrierActiveInput = z.infer<typeof toggleCarrierActiveSchema>;
export type SetProductCarriersInput = z.infer<typeof setProductCarriersSchema>;

// QUERY / PARAM TYPES
export type CarrierQueryInput = z.infer<typeof carrierQuerySchema>;
export type CarrierIdParam = z.infer<typeof carrierIdParamSchema>;
