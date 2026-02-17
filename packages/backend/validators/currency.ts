import { validateParams, validateQuery } from "@/middleware/validation";
import {
  currencyCodeSchema,
  currencyQuerySchema,
} from "@mini-erp/shared/validators/currency";

export const validateCurrencyQuery = validateQuery(
  currencyQuerySchema,
  "Currency Query",
);

export const validateCurrencyCodeParam = validateParams(
  currencyCodeSchema,
  "Currency Code",
);
