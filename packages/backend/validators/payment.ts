// ============================================================================
// VALIDATION HELPERS
// ============================================================================

import { validateBody, validateParams } from "@/middleware/validation";
import {
  CalculateDueDatesSchema,
  CreatePaymentMethodSchema,
  PaymentMethodIdSchema,
  PaymentQuerySchema,
  TogglePaymentStatusSchema,
  UpdatePaymentMethodSchema,
  UpdatePaymentTermDetailsSchema,
} from "@mini-erp/shared/validators";

export const validatePaymentQuery = validateParams(
  PaymentQuerySchema,
  "Payment query",
);

/**
 * Valida i dati per la creazione di un Payment Method
 */
export const validateCreatePaymentMethod = validateBody(
  CreatePaymentMethodSchema,
  "Payment method creation",
);

/**
 * Valida i dati per l'aggiornamento di un Payment Method
 */
export const validateUpdatePaymentMethod = validateBody(
  UpdatePaymentMethodSchema,
  "Payment method update",
);

/**
 * Valida i dati per aggiornamento Payment Term Details
 */
export const validateUpdatePaymentTermDetails = validateBody(
  UpdatePaymentTermDetailsSchema,
  "Payment term details update",
);

export const validatePaymentMethodIdParam = validateParams(
  PaymentMethodIdSchema,
  "Payment Method ID",
);

export const validateTogglePaymentMethod = validateBody(
  TogglePaymentStatusSchema,
  "Toggle status",
);

export const validateCalcolateDueDates = validateBody(
  CalculateDueDatesSchema,
  "Calculate due dates",
);
