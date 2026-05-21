// middleware/validation-middleware.ts
import { createMiddleware } from "hono/factory";
import { ZodError, ZodObject, ZodType } from "zod";
import { applySchemaOptions, handleZodError } from "../helpers/validate-helper";
import type { RequestValidationSchema, ValidateOptions } from "../types/validate-types";
import type { AppBindings } from "../lib/hono-app";

// Chiavi riservate per i dati validati nel context Hono
const VALIDATED_BODY_KEY = "validatedBody" as const;
const VALIDATED_QUERY_KEY = "validatedQuery" as const;
const VALIDATED_PARAMS_KEY = "validatedParams" as const;

/**
 * Generic Zod validation middleware for Hono.
 * Validates request body, query params, and path params against a Zod schema.
 * Stores validated data in the Hono context via c.set().
 *
 * @param schema  - A single ZodType or a RequestValidationSchema with body/query/params keys
 * @param context - Human-readable label used in validation error logs
 * @param options - Validation options: source, stripUnknown, passthrough
 *
 * @example
 * // Body only
 * app.post("/products", validate(CreateProductSchema, "Product creation"), handler);
 *
 * @example
 * // Body + params
 * app.put("/products/:id", validate({ body: UpdateProductSchema, params: ProductIdSchema }, "Product update"), handler);
 *
 * @example
 * // Query with options
 * app.get("/products", validate(ProductQuerySchema, "Product query", { source: ["query"], stripUnknown: true }), handler);
 */
const validate = (
  schema: ZodType | RequestValidationSchema,
  context: string,
  options: ValidateOptions = {},
) => {
  const config: ValidateOptions = {
    source: ["body"],
    stripUnknown: false,
    passthrough: false,
    ...options,
  };

  return createMiddleware<AppBindings>(async (c, next) => {
    try {
      const isZodObject = schema instanceof ZodObject;
      const hasZodKeys =
        isZodObject &&
        ("query" in schema.shape || "body" in schema.shape || "params" in schema.shape);

      if (hasZodKeys) {
        // -- Multi-part schema (body + query + params) --
        const requestSchema = schema as RequestValidationSchema;

        if (requestSchema.body) {
          const bodySchema = applySchemaOptions(requestSchema.body, config);
          const raw = await c.req.json();
          c.set(VALIDATED_BODY_KEY, await bodySchema.parseAsync(raw));
        }

        if (requestSchema.query) {
          const querySchema = applySchemaOptions(requestSchema.query, config);
          c.set(VALIDATED_QUERY_KEY, await querySchema.parseAsync(c.req.query()));
        }

        if (requestSchema.params) {
          const paramsSchema = applySchemaOptions(requestSchema.params, config);
          c.set(VALIDATED_PARAMS_KEY, await paramsSchema.parseAsync(c.req.param()));
        }
      } else {
        // -- Single schema --
        const singleSchema = applySchemaOptions(schema as ZodType, config);

        if (config.source!.length === 1) {
          const source = config.source![0];

          let raw: unknown;
          if (source === "body") {
            raw = await c.req.json();
          } else if (source === "query") {
            raw = c.req.query();
          } else {
            raw = c.req.param();
          }

          const validated = await singleSchema.parseAsync(raw);

          if (source === "body") c.set(VALIDATED_BODY_KEY, validated);
          else if (source === "query") c.set(VALIDATED_QUERY_KEY, validated);
          else if (source === "params") c.set(VALIDATED_PARAMS_KEY, validated);
        } else {
          // Multiple sources combined
          const dataToValidate: Record<string, unknown> = {};

          for (const source of config.source!) {
            if (source === "body") dataToValidate.body = await c.req.json();
            else if (source === "query") dataToValidate.query = c.req.query();
            else if (source === "params") dataToValidate.params = c.req.param();
          }

          const validated = (await singleSchema.parseAsync(dataToValidate)) as Record<
            string,
            unknown
          >;

          for (const source of config.source!) {
            if (validated[source] !== undefined) {
              if (source === "body") c.set(VALIDATED_BODY_KEY, validated.body);
              else if (source === "query") c.set(VALIDATED_QUERY_KEY, validated.query);
              else if (source === "params") c.set(VALIDATED_PARAMS_KEY, validated.params);
            }
          }
        }
      }

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, context);
      }
      throw error;
    }
  });
};

/**
 * Shorthand middleware to validate only the request body.
 */
export const validateBody = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">,
) => validate(schema, context, { ...options, source: ["body"] });

/**
 * Shorthand middleware to validate only the query string.
 */
export const validateQuery = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">,
) => validate(schema, context, { ...options, source: ["query"] });

/**
 * Shorthand middleware to validate only the path params.
 */
export const validateParams = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">,
) => validate(schema, context, { ...options, source: ["params"] });
