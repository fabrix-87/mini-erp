// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  CalculateDueDatesSchema,
  CreatePaymentMethodSchema,
  PaymentMethodIdSchema,
  PaymentMethodTranslationSchema,
  PaymentQuerySchema,
  TermTypeSchema,
  TogglePaymentStatusSchema,
  UpdatePaymentMethodSchema,
  UpdatePaymentTermDetailsSchema,
} from "../validators";

export type CreatePaymentMethodInput = z.infer<
  typeof CreatePaymentMethodSchema
>;
export type UpdatePaymentMethodInput = z.infer<
  typeof UpdatePaymentMethodSchema
>;
export type UpdatePaymentTermDetailsInput = z.infer<
  typeof UpdatePaymentTermDetailsSchema
>;
export type CalculateDueDatesInput = z.infer<typeof CalculateDueDatesSchema>;
export type PaymentQueryInput = z.infer<typeof PaymentQuerySchema>;
export type TogglePaymentStatusInput = z.infer<
  typeof TogglePaymentStatusSchema
>;
export type TermType = z.infer<typeof TermTypeSchema>;
export type PaymentTermDetail = z.infer<typeof UpdatePaymentTermDetailsSchema>;
export type PaymentMethodTranslation = z.infer<
  typeof PaymentMethodTranslationSchema
>;

export type PaymentMethodIdInput = z.infer<typeof PaymentMethodIdSchema>;
