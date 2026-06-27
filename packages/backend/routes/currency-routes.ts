import { getAllCurrencies, getCurrencyByCode } from "@/controllers/currency-controller";
import { createHonoApp } from "@/lib/hono-app";
import { validateCurrencyCodeParam, validateCurrencyQuery } from "@/validators/currency-validator";

const currencyRoutes = createHonoApp();

/**
 * @route GET /api/currencies
 * @access Private (currency:read)
 * @description Get all currencies.
 */
currencyRoutes.get("/", validateCurrencyQuery, getAllCurrencies);

/**
 * @route GET /api/currencies/:code
 * @access Private (currency:read)
 * @description Get a specific currency by code.
 */
currencyRoutes.get("/:code", validateCurrencyCodeParam, getCurrencyByCode);

export default currencyRoutes;
