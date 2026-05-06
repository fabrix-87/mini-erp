import { validateBody, validateParams } from "@/middleware/validation-middleware";
import {
  calculateDueDatesSchema,
  createPaymentMethodSchema,
  paymentMethodIdSchema,
  paymentQuerySchema,
  togglePaymentStatusSchema,
  updatePaymentMethodSchema,
  updatePaymentTermDetailsSchema,
} from "@mini-erp/shared/validators";

export const validatePaymentQuery = validateParams(paymentQuerySchema, "Payment query");

/**
 * Valida i dati per la creazione di un Payment Method
 */
export const validateCreatePaymentMethod = validateBody(
  createPaymentMethodSchema,
  "Payment method creation",
);

/**
 * Valida i dati per l'aggiornamento di un Payment Method
 */
export const validateUpdatePaymentMethod = validateBody(
  updatePaymentMethodSchema,
  "Payment method update",
);

/**
 * Valida i dati per aggiornamento Payment Term Details
 */
export const validateUpdatePaymentTermDetails = validateBody(
  updatePaymentTermDetailsSchema,
  "Payment term details update",
);

export const validatePaymentMethodIdParam = validateParams(
  paymentMethodIdSchema,
  "Payment Method ID",
);

export const validateTogglePaymentMethod = validateBody(togglePaymentStatusSchema, "Toggle status");

export const validateCalcolateDueDates = validateBody(
  calculateDueDatesSchema,
  "Calculate due dates",
);
