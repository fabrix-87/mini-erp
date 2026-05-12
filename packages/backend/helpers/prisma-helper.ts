import { Prisma } from "../generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Applica una trasformazione solo se il valore è definito.
 *
 * Utile per costruire oggetti dinamici (es. Prisma update input)
 * evitando di includere proprietà con valore `undefined`.
 *
 * @param value - Valore opzionale da controllare
 * @param mapper - Funzione che trasforma il valore se presente
 * @returns Il risultato del mapper oppure `undefined`
 */
export const ifDefined = <T>(value: T | undefined, mapper: (v: T) => any) =>
  value !== undefined ? mapper(value) : undefined;

/**
 * Converte un numero o stringa in Prisma.Decimal.
 *
 * Se il valore è `undefined` non viene effettuata alcuna conversione,
 * permettendo a Prisma di ignorare il campo durante un update.
 *
 * @param value - Numero o stringa rappresentante un valore decimale
 * @returns Prisma.Decimal oppure `undefined`
 */
export const toDecimal = (value: number | string | undefined) =>
  value !== undefined ? new Prisma.Decimal(value.toString()) : undefined;

/**
 * Converte una stringa in Date per Prisma.
 *
 * Comportamento:
 * - `undefined` → campo non aggiornato
 * - string valida → Date
 * - valore falsy esplicito (es. null passato dal form) → null (reset DB)
 *
 * Utile per distinguere tra:
 * - "non modificare il campo"
 * - "impostare NULL nel database"
 *
 * @param value - Data in formato stringa (ISO consigliato)
 * @returns Date, null o undefined
 */
export const toDate = (value: string | undefined) =>
  value ? new Date(value) : value === undefined ? undefined : null;

/**
 * Converte input date del DTO in formato Prisma-safe.
 *
 * undefined → non aggiornare
 * null → setta NULL
 * string → parse Date
 */
export const parseOptionalDate = (value: string | null | undefined): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Converts an optional nullable string value to a Prisma-compatible Decimal or undefined.
 * Returns undefined when the input is undefined (field not included in update).
 * Returns null when the input is null/empty (explicit clear).
 */
export const parseOptionalDecimal = (
  val: Decimal | string | number | null | undefined,
): Prisma.Decimal | null | undefined => {
  if (val === undefined) return undefined;
  return val ? new Prisma.Decimal(Number(val)) : null;
};

/**
 * Converts a string to Date for required (non-nullable) DateTime fields.
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
 * Handles nullable Prisma relations connected via `id` (numeric FK).
 * For relations with custom unique keys (e.g. `code`), use `ifDefined` directly.
 *
 * @param id - Numeric ID of the relation
 * @returns Prisma connect/disconnect object or undefined
 */
export const connectOrDisconnectById = (id: number | null | undefined) =>
  id === undefined ? undefined : id ? { connect: { id } } : { disconnect: true as const };

/**
 * Handles nullable Prisma relations connected via a string `code` field.
 *
 * @param code - Unique string code of the relation
 * @returns Prisma connect/disconnect object or undefined
 */
export const connectOrDisconnectByCode = (code: string | null | undefined) =>
  code === undefined ? undefined : code ? { connect: { code } } : { disconnect: true as const };

/**
 * Rimuove tutte le proprietà con valore `undefined` da un oggetto.
 *
 * Utile prima di passare un oggetto a Prisma per evitare campi inutili.
 * NON rimuove null (che ha significato semantico nei DB).
 *
 * @param obj - Oggetto da pulire
 * @returns Nuovo oggetto senza proprietà undefined
 */
export const clean = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

/**
 * Converts a nullable JS value to a Prisma-compatible nullable JSON value.
 * Prisma requires Prisma.JsonNull instead of native null for Json? fields.
 *
 * @param value - Any serializable value or null/undefined
 * @returns Prisma.JsonNull or the value cast as InputJsonValue
 */
export function toJsonField(value: unknown): typeof Prisma.JsonNull | Prisma.InputJsonValue {
  return value != null ? (value as Prisma.InputJsonValue) : Prisma.JsonNull;
}

/**
 * Converts all null values to undefined in an object.
 * Use before passing form/DTO data to Prisma create/update when
 * optional FK fields are typed as `T | null | undefined` but Prisma
 * expects `T | undefined` (null is reserved for explicit DB NULL on non-FK fields).
 *
 * @param obj - Object with potentially null values
 * @returns Same object with null replaced by undefined
 */
export const nullToUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v])) as T;

// In packages/backend/helpers/prisma-helper.ts

/**
 * Builds a Prisma-safe soft-delete filter.
 * Adds deletedAt: null unless `includeDeleted` is true.
 */
export const withSoftDelete = (
  where: Record<string, unknown>,
  includeDeleted = false,
): Record<string, unknown> => (includeDeleted ? where : { ...where, deletedAt: null });

/**
 * Converts a numeric string or number to a Prisma-safe integer.
 * Throws if the value is not a valid integer.
 */
export const toIntId = (value: string | number, fieldName = "id"): number => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }
  return n;
};

/**
 * Builds pagination skip/take from page and limit.
 */
export const toPagination = (
  page: number | string = 1,
  limit: number | string = 20,
): { skip: number; take: number } => {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  return { skip: (p - 1) * l, take: l };
};
