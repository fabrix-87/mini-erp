import { z } from "zod";
import { termTypeSchema } from "../validators";

export type TermType = z.infer<typeof termTypeSchema>;

export const PAYMENT_TERM_TYPE = {
  anticipated: "anticipated",
  days_from_invoice: "days_from_invoice",
  end_of_month: "end_of_month",
  fixed_date: "fixed_date",
} as const;
