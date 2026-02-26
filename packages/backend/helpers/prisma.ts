import { Prisma } from "@/generated/prisma/client";

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
export const connectOrDisconnectById = (
  id: number | null | undefined,
) =>
  id === undefined
    ? undefined
    : id
      ? { connect: { id } }
      : { disconnect: true as const };

/**
 * Handles nullable Prisma relations connected via a string `code` field.
 *
 * @param code - Unique string code of the relation
 * @returns Prisma connect/disconnect object or undefined
 */
export const connectOrDisconnectByCode = (
  code: string | null | undefined,
) =>
  code === undefined
    ? undefined
    : code
      ? { connect: { code } }
      : { disconnect: true as const };


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
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
