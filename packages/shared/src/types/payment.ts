// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  calculateDueDatesSchema,
  createPaymentMethodSchema,
  paymentMethodIdSchema,
  paymentMethodTranslationSchema,
  paymentQuerySchema,
  paymentTermDetailSchema,
  togglePaymentStatusSchema,
  updatePaymentMethodSchema,
  updatePaymentTermDetailsSchema,
} from "../validators";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * PaymentMethod entity
 */
export type PaymentMethod = CreatePaymentMethodInput & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * PaymentTermDetail entity
 */
export type PaymentTermDetail = {
  id: number;
} & z.infer<typeof paymentTermDetailSchema>;

/**
 * PaymentMethodTranslation entity
 */
export type PaymentMethodTranslation = {
  id: number;
} & z.infer<typeof paymentMethodTranslationSchema>;

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================
export type CreatePaymentMethodInput = z.infer<
  typeof createPaymentMethodSchema
>;
export type UpdatePaymentMethodInput = z.infer<
  typeof updatePaymentMethodSchema
>;
export type UpdatePaymentTermDetailsInput = z.infer<
  typeof updatePaymentTermDetailsSchema
>;
export type CalculateDueDatesInput = z.infer<typeof calculateDueDatesSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;

// ============================================================================
// ACTION TYPES (using z.infer)
// ============================================================================
export type TogglePaymentStatusInput = z.infer<
  typeof togglePaymentStatusSchema
>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================
export type PaymentMethodIdParam = z.infer<typeof paymentMethodIdSchema>;
