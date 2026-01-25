import z from "zod";
import {
  CreditCheckStatusSchema,
  CustomerPrioritySchema,
  CustomerSegmentSchema,
  CustomerSizeSchema,
  CustomerTypeSchema,
  LeadStatusSchema,
} from "../validators";

export type CustomerType = z.infer<typeof CustomerTypeSchema>;
export type CustomerPriority = z.infer<typeof CustomerPrioritySchema>;
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type CreditCheckStatus = z.infer<typeof CreditCheckStatusSchema>;
export type CustomerSize = z.infer<typeof CustomerSizeSchema>;
