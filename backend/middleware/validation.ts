// ============================================================================
// VALIDATION MIDDLEWARE
// /middleware/validation.ts
// ============================================================================

import { ZodError, ZodObject, ZodType } from "zod";
import { applySchemaOptions, handleZodError } from "../helpers/validate";
import { RequestValidationSchema, ValidateOptions } from "../types/validate";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware generico per la validazione con Zod
 *
 * @example
 * // Validazione solo del body
 * router.post('/products',
 *   validate(CreateProductSchema, 'Product creation'),
 *   productController.create
 * );
 *
 * @example
 * // Validazione di body e params
 * router.put('/products/:id',
 *   validate({
 *     body: UpdateProductSchema,
 *     params: ProductIdSchema
 *   }, 'Product update'),
 *   productController.update
 * );
 *
 * @example
 * // Validazione con opzioni personalizzate
 * router.get('/products',
 *   validate(
 *     ProductQuerySchema,
 *     'Product query',
 *     { source: ['query'], stripUnknown: true }
 *   ),
 *   productController.list
 * );
 */
export const validate = (
  schema: ZodType | RequestValidationSchema,
  context: string,
  options: ValidateOptions = {}
) => {
  // Opzioni di default
  const defaultOptions: ValidateOptions = {
    source: ["body"],
    stripUnknown: false,
    passthrough: false,
  };

  const config = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Se lo schema è un oggetto con body/query/params
      const isZodObject = schema instanceof ZodObject;
      const hasZodKeys =
        isZodObject &&
        ("query" in schema.shape ||
          "body" in schema.shape ||
          "params" in schema.shape);

      if (hasZodKeys) {
        const requestSchema = schema as RequestValidationSchema;

        // Valida body se presente
        if (requestSchema.body) {
          const bodySchema = applySchemaOptions(requestSchema.body, config);
          Object.assign(req.body, await bodySchema.parseAsync(req.body));
        }

        // Valida query se presente
        if (requestSchema.query) {
          const querySchema = applySchemaOptions(requestSchema.query, config);
          const validatedQuery = await querySchema.parseAsync(req.query);
          (req as any).validatedQuery = validatedQuery;
        }

        // Valida params se presente
        if (requestSchema.params) {
          const paramsSchema = applySchemaOptions(requestSchema.params, config);
          const validatedParams = await paramsSchema.parseAsync(req.params);
          (req as any).validatedParams = validatedParams;
        }
      } else {
        // Schema singolo - valida le parti specificate in source
        const singleSchema = applySchemaOptions(schema as ZodType, config);

        // Crea un oggetto con le parti da validare
        const dataToValidate: Record<string, any> = {};

        for (const source of config.source!) {
          dataToValidate[source] = req[source];
        }

        // Se c'è solo una source, valida direttamente
        if (config.source!.length === 1) {
          const source = config.source![0];
          const validated = await singleSchema.parseAsync(req[source]);

          // Assegna con type assertion appropriata per ogni tipo
          if (source === "body") {
            req.body = validated;
          } else if (source === "query") {
            (req as any).validatedQuery = validated;
          } else if (source === "params") {
            (req as any).validatedParams = validated;
          }
        } else {
          // Altrimenti valida l'oggetto combinato
          const validated = (await singleSchema.parseAsync(
            dataToValidate
          )) as Record<string, any>;

          // Riassegna i valori validati con type assertion
          for (const source of config.source!) {
            if (validated[source] !== undefined) {
              if (source === "body") {
                req.body = validated[source];
              } else if (source === "query") {
                req.query = validated[source] as any;
              } else if (source === "params") {
                req.params = validated[source] as any;
              }
            }
          }
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Usa handleZodError che lancia ValidationError
        handleZodError(error, context);
      }
      // Passa altri errori al middleware di gestione errori
      next(error);
    }
  };
};

/**
 * Middleware semplificato per validare solo il body
 */
export const validateBody = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">
) => validate(schema, context, { ...options, source: ["body"] });

/**
 * Middleware semplificato per validare solo i query params
 */
export const validateQuery = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">
) => validate(schema, context, { ...options, source: ["query"] });

/**
 * Middleware semplificato per validare solo i params
 */
export const validateParams = (
  schema: ZodType,
  context: string,
  options?: Omit<ValidateOptions, "source">
) => validate(schema, context, { ...options, source: ["params"] });
