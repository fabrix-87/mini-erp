import { Prisma } from "../generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Applies a transformation only if the value is defined.
 *
 * Useful for building dynamic objects (e.g. Prisma update input)
 * without including properties with an `undefined` value.
 *
 * @param value  - Optional value to check
 * @param mapper - Function that transforms the value if present
 * @returns The mapper result, or `undefined`
 */
export const ifDefined = <T, U>(value: T | undefined, mapper: (v: T) => U): U | undefined =>
  value !== undefined ? mapper(value) : undefined;

/**
 * Converts a number or string to a Prisma.Decimal.
 *
 * When the value is `undefined`, no conversion is performed,
 * allowing Prisma to ignore the field during an update.
 *
 * @param value - Number or string representing a decimal value
 * @returns Prisma.Decimal or `undefined`
 */
export const toDecimal = (value: number | string | undefined) =>
  value !== undefined ? new Prisma.Decimal(value.toString()) : undefined;

/**
 * Converts a string to a Date for Prisma optional DateTime? fields.
 *
 * Behaviour:
 * - `undefined` → field not updated
 * - valid string → Date
 * - explicit falsy (e.g. null from a form) → null (DB reset)
 *
 * Use this helper only for nullable DateTime? fields.
 * For required DateTime fields use `toRequiredDate` instead.
 *
 * @param value - Date string (ISO recommended)
 * @returns Date, null, or undefined
 */
export const toDate = (value: string | undefined) =>
  value ? new Date(value) : value === undefined ? undefined : null;

/**
 * Converts optional nullable DTO date input to a Prisma-safe value.
 *
 * - undefined → field not updated
 * - null      → set NULL in DB
 * - string    → parsed Date (returns null if invalid)
 *
 * @param value - Date string, null, or undefined
 * @returns Date, null, or undefined
 */
export const parseOptionalDate = (value: string | null | undefined): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Converts an optional nullable value to a Prisma-compatible Decimal.
 *
 * - undefined     → field not included in update
 * - null / falsy  → null (explicit clear)
 * - number/string → new Prisma.Decimal
 *
 * Note: when `val` is already a Decimal instance it is reconstructed via
 * its numeric representation — functionally correct but slightly redundant.
 *
 * @param val - Decimal, string, number, null, or undefined
 * @returns Prisma.Decimal, null, or undefined
 */
export const parseOptionalDecimal = (
  val: Decimal | string | number | null | undefined,
): Prisma.Decimal | null | undefined => {
  if (val === undefined) return undefined;
  return val ? new Prisma.Decimal(Number(val)) : null;
};

/**
 * Converts a string to Date for required (non-nullable) DateTime fields.
 *
 * - `undefined` → field not updated
 * - string      → Date
 *
 * Unlike `toDate`, this helper never returns null because the DB field
 * does not allow NULL. Use `toDate` only for optional DateTime? fields.
 *
 * @param value - Date string (ISO recommended)
 * @returns Date or undefined
 */
export const toRequiredDate = (value: string | undefined): Date | undefined =>
  value ? new Date(value) : undefined;

/**
 * Handles nullable Prisma relations connected via a `id` FK.
 * For relations with custom unique keys (e.g. `code`), use `ifDefined` directly.
 *
 * - undefined → field not updated
 * - falsy (0/null) → disconnect
 * - number | string → connect
 *
 * @param id - ID of the related record
 * @returns Prisma connect/disconnect object or undefined
 */
export function connectOrDisconnectById(id: string): { connect: { id: string } };
export function connectOrDisconnectById(id: number): { connect: { id: number } };
export function connectOrDisconnectById(id: null | undefined): undefined;
export function connectOrDisconnectById(id: string | null | undefined): { connect: { id: string } } | undefined;
export function connectOrDisconnectById(id: number | null | undefined): { connect: { id: number } } | undefined;
export function connectOrDisconnectById(id: string | number | null | undefined) {
  return id === undefined ? undefined : id ? { connect: { id } } : { disconnect: true as const };
}

/**
 * Handles nullable Prisma relations on CREATE operations via an `id` FK.
 * Returns connect if id is provided, undefined otherwise.
 * null is not valid on create — use `connectOrDisconnectById` for updates.
 *
 * @param id - ID of the related record
 * @returns Prisma connect object or undefined
 */
export function connectById(id: string): { connect: { id: string } };
export function connectById(id: number): { connect: { id: number } };
export function connectById(id: null | undefined): undefined;
export function connectById(id: string | null | undefined): { connect: { id: string } } | undefined;
export function connectById(id: number | null | undefined): { connect: { id: number } } | undefined;
export function connectById(id: string | number | null | undefined) {
  return id ? { connect: { id } } : undefined;
}

/**
 * Handles nullable Prisma relations on CREATE operations via a `code` FK.
 * Returns connect if code is provided, undefined otherwise.
 * null is not valid on create — use `connectOrDisconnectByCode` for updates.
 *
 * @param code - Unique string code of the related record
 * @returns Prisma connect object or undefined
 */
export function connectByCode(code: string | null | undefined) {
  return code ? { connect: { code } } : undefined;
}

/**
 * Handles nullable Prisma relations connected via a string `code` unique field.
 *
 * - undefined → field not updated
 * - falsy (null/"") → disconnect
 * - string → connect
 *
 * @param code - Unique string code of the related record
 * @returns Prisma connect/disconnect object or undefined
 */
export const connectOrDisconnectByCode = (code: string | null | undefined) =>
  code === undefined ? undefined : code ? { connect: { code } } : { disconnect: true as const };

/**
 * Removes all properties with an `undefined` value from an object.
 *
 * Useful before passing an object to Prisma to avoid unnecessary fields.
 * Does NOT remove null, which carries semantic meaning in the database.
 *
 * @param obj - Object to clean
 * @returns New object without undefined properties
 */
export const clean = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

/**
 * Converts a nullable JS value to a Prisma-compatible nullable JSON value.
 * Prisma requires `Prisma.JsonNull` instead of native null for Json? fields.
 *
 * @param value - Any serializable value or null/undefined
 * @returns Prisma.JsonNull or the value cast as InputJsonValue
 */
export function toJsonField(value: unknown): typeof Prisma.JsonNull | Prisma.InputJsonValue {
  return value != null ? (value as Prisma.InputJsonValue) : Prisma.JsonNull;
}

/**
 * Converts all null values to undefined in a plain object.
 *
 * Use before passing form/DTO data to Prisma create/update when optional FK
 * fields are typed as `T | null | undefined` but Prisma expects `T | undefined`
 * (null is reserved for explicit DB NULL on non-FK fields).
 *
 * @param obj - Object with potentially null values
 * @returns Same object with null replaced by undefined
 */
export const nullToUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v])) as T;

/**
 * Builds a Prisma-safe soft-delete filter by injecting `deletedAt: null`.
 *
 * Composable with `withTenantId`:
 * @example
 * const filter = withSoftDelete(withTenantId({}, tenantId));
 *
 * @param where          - Existing Prisma where clause
 * @param includeDeleted - When true, soft-deleted records are included (default: false)
 * @returns New where clause with soft-delete guard applied
 */
export const withSoftDelete = (
  where: Record<string, unknown>,
  includeDeleted = false,
): Record<string, unknown> => (includeDeleted ? where : { ...where, deletedAt: null });

/**
 * Injects a mandatory tenantId filter into a Prisma where clause.
 *
 * Use this on every query against tenant-scoped models (leads, customers,
 * companies, contacts, documents, opportunities, products, pricelists,
 * payments, suppliers, addresses, …) to prevent cross-tenant data leakage.
 *
 * Composable with `withSoftDelete`:
 * @example
 * const filter = withSoftDelete(withTenantId({}, tenantId));
 *
 * @param where    - Existing Prisma where clause
 * @param tenantId - Tenant ID from the authenticated request context
 * @returns New where clause with tenantId enforced
 */
export const withTenantId = (
  where: Record<string, unknown>,
  tenantId: string,
): Record<string, unknown> => ({ ...where, tenantId });

/**
 * Builds a tenant-scoped, soft-delete-safe Prisma where clause.
 *
 * Combines `withTenantId` and `withSoftDelete` in a single call, covering
 * the most common filter pattern in tenant-scoped controllers.
 *
 * Variants:
 * - `tenantFilter(tenantId)`           → { tenantId, deletedAt: null }
 * - `tenantFilter(tenantId, { id })`   → { tenantId, id, deletedAt: null }
 * - `tenantFilter(tenantId, {}, true)` → { tenantId }  (soft-deleted included)
 *
 * @param tenantId       - Tenant ID from the authenticated request context
 * @param where          - Additional Prisma where fields to merge (default: {})
 * @param includeDeleted - When true, soft-deleted records are included (default: false)
 * @returns Merged where clause with tenantId and optional deletedAt guard
 */
export const tenantFilter = (
  tenantId: string,
  where: Record<string, unknown> = {},
  includeDeleted = false,
): Record<string, unknown> => withSoftDelete(withTenantId(where, tenantId), includeDeleted);

/**
 * Converts a numeric string or number to a Prisma-safe positive integer.
 *
 * Only applicable to Int @default(autoincrement()) models.
 * Never call this on CUID-based models — params are already strings.
 *
 * @param value     - String or number to convert
 * @param fieldName - Field name used in the error message (default: "id")
 * @returns Positive integer
 * @throws Error if the value is missing, non-integer, or non-positive
 */
export const toIntId = (value: string | number | undefined, fieldName = "id"): number => {
  if (!value) {
    throw new Error(`Undefined ${fieldName}`);
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }
  return n;
};

/**
 * Builds Prisma-compatible `skip` / `take` pagination values from page and limit.
 *
 * - Page is clamped to a minimum of 1.
 * - Limit is clamped between 1 and 100.
 *
 * @param page  - Page number (1-based, default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @returns Object with `skip` and `take` ready for Prisma queries
 */
export const toPagination = (
  page: number | string = 1,
  limit: number | string = 20,
): { skip: number; take: number } => {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  return { skip: (p - 1) * l, take: l };
};
