// types/validate-types.ts
import { ZodType } from "zod";

/**
 * Configuration options for the validation middleware.
 */
export interface ValidateOptions {
  /**
   * Request parts to validate.
   * @default ['body']
   */
  source?: ("body" | "query" | "params")[];

  /**
   * If true, strips unknown fields not defined in the schema.
   * @default false
   */
  stripUnknown?: boolean;

  /**
   * If true, allows unknown fields to pass through the schema.
   * @default false
   */
  passthrough?: boolean;
}

/**
 * Schema object for validating multiple parts of the request simultaneously.
 */
export interface RequestValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}
