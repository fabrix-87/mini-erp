// ============================================================================
// TYPES
// ============================================================================

import { ZodType } from "zod";
import { Request } from "express";
import { AuthRequest } from "./user";

/**
 * Opzioni di configurazione per la validazione
 */
export interface ValidateOptions {
  /**
   * Parti della request da validare
   * @default ['body']
   */
  source?: ("body" | "query" | "params")[];

  /**
   * Se true, stripa i campi non definiti nello schema
   * @default false
   */
  stripUnknown?: boolean;

  /**
   * Se true, permette campi non definiti nello schema
   * @default false
   */
  passthrough?: boolean;
}

/**
 * Schema per validare diverse parti della request
 */
export interface RequestValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}


// Tipo base per richieste validate
export interface ValidatedRequest extends Request {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
}

// Tipo combinato: richiesta autenticata + validata
export interface AuthenticatedValidatedRequest extends AuthRequest {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
}
