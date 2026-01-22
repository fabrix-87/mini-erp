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
  PaymentTermDetailSchema,
  TermTypeSchema,
  TogglePaymentStatusSchema,
  UpdatePaymentMethodSchema,
  UpdatePaymentTermDetailsSchema,
} from "../validators";

export type PaymentMethod = CreatePaymentMethodInput & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

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
export type PaymentTermDetail = {
  id: number;
} & z.infer<typeof PaymentTermDetailSchema>;
export type PaymentMethodTranslation = {
  id: number;
} & z.infer<typeof PaymentMethodTranslationSchema>;

export type PaymentMethodIdInput = z.infer<typeof PaymentMethodIdSchema>;
