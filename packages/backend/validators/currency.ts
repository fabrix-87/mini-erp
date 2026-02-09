import { validateParams, validateQuery } from "@/middleware/validation";
import {
  CurrencyCodeSchema,
  CurrencyQuerySchema,
} from "@mini-erp/shared/validators/currency";

export const validateCurrencyQuery = validateQuery(
  CurrencyQuerySchema,
  "Currency Query",
);

export const validateCurrencyCodeParam = validateParams(
  CurrencyCodeSchema,
  "Currency Code",
);
