// packages/backend/helpers/pricelist-helper.ts
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { MAX_PRICE_LIST_DEPTH } from "@mini-erp/shared";


export type Db = Prisma.TransactionClient | typeof prisma;

/** Business-rule violation raised by price list helpers and the price resolver. */
export class PriceListError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "INVALID",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Validates a parent assignment: same tenant, same currency, no cycle, bounded depth.
 * @param db - Prisma client or transaction client
 * @param tenantId - Current tenant
 * @param params.listId - List being updated (omit on create)
 * @param params.parentListId - Requested parent
 * @param params.currencyCode - Currency of the child list
 * @throws PriceListError when a rule is violated
 */
export async function assertValidPriceListParent(
  db: Db,
  tenantId: string,
  params: { listId?: string; parentListId: string; currencyCode: string },
): Promise<void> {
  const seen = new Set<string>(params.listId ? [params.listId] : []);
  let currentId: string | null = params.parentListId;
  let depth = 0;

  while (currentId) {
    if (seen.has(currentId))
      throw new PriceListError("INVALID", "Rilevato ciclo nella gerarchia dei listini");
    if (++depth >= MAX_PRICE_LIST_DEPTH)
      throw new PriceListError("INVALID", "Gerarchia dei listini troppo profonda");
    seen.add(currentId);

    const parent: { parentListId: string | null; currencyCode: string } | null =
      await db.priceList.findFirst({
        where: { id: currentId, tenantId },
        select: { parentListId: true, currencyCode: true },
      });
    if (!parent) throw new PriceListError("NOT_FOUND", "Parent Price List non trovato");
    if (parent.currencyCode !== params.currencyCode) {
      throw new PriceListError("INVALID", "Il listino padre deve avere la stessa valuta");
    }
    currentId = parent.parentListId;
  }
}
