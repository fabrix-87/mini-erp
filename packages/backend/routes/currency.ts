import { getAllCurrencies } from "@/controllers/currency";
import { authenticateToken } from "@/middleware/auth";
import { validateCurrencyCodeParam, validateCurrencyQuery } from "@/validators/currency";
import express from "express";

const router = express.Router();

router.get(
    '/',
    authenticateToken,
    validateCurrencyQuery,
    getAllCurrencies
)

router.get(
    '/:code',
    authenticateToken,
    validateCurrencyCodeParam,
)


export default router;