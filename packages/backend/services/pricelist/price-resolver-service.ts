// packages/backend/services/pricelist/price-resolver-service.ts
import {
  PRICE_SOURCE,
  MAX_PRICE_LIST_DEPTH,
  applyPriceListStrategy,
  roundPrice,
  selectPriceListItem,
  type ResolvedPrice,
  type ResolvePriceInput,
  Decimal,
} from "@mini-erp/shared";
import { PriceListError, type Db } from "@/helpers/pricelist-helper";

const LIST_SELECT = {
  id: true,
  currencyCode: true,
  active: true,
  validFrom: true,
  validTo: true,
  parentListId: true,
  strategy: true,
  strategyValue: true,
  roundingMethod: true,
} as const;

const isUsable = (
  list: { active: boolean; validFrom: Date | null; validTo: Date | null; currencyCode: string },
  at: Date,
  currencyCode?: string,
): boolean =>
  list.active &&
  (!list.validFrom || list.validFrom <= at) &&
  (!list.validTo || list.validTo >= at) &&
  (!currencyCode || list.currencyCode === currencyCode);

/** Base units per 1 unit of `uomId`. Packaging units always go through ProductUom. */
async function resolveUomFactor(
  db: Db,
  tenantId: string,
  product: { id: string; baseUomId: string },
  uomId?: string,
): Promise<Decimal> {
  if (!uomId || uomId === product.baseUomId) return new Decimal(1);

  const productUom = await db.productUom.findUnique({
    where: { tenantId_productId_uomId: { tenantId, productId: product.id, uomId } },
    select: { factor: true },
  });
  if (productUom) return new Decimal(productUom.factor.toString());

  const [uom, base] = await Promise.all([
    db.unitOfMeasure.findFirst({ where: { id: uomId, tenantId, active: true } }),
    db.unitOfMeasure.findFirst({ where: { id: product.baseUomId, tenantId } }),
  ]);
  if (!uom || !base) throw new PriceListError("NOT_FOUND", "Unità di misura non trovata");
  if (uom.category === "PACKAGING" || uom.category !== base.category) {
    throw new PriceListError("INVALID", "Unità di misura non convertibile per questo prodotto");
  }
  return new Decimal(uom.factor.toString()).div(base.factor.toString());
}

/** Picks the effective list: explicit > customer default > tenant default. */
async function pickPriceList(db: Db, tenantId: string, input: ResolvePriceInput, at: Date) {
  const load = (id: string) =>
    db.priceList.findFirst({ where: { id, tenantId }, select: LIST_SELECT });

  if (input.priceListId) {
    const list = await load(input.priceListId);
    if (!list) throw new PriceListError("NOT_FOUND", "Price List non trovato");
    return isUsable(list, at, input.currencyCode) ? list : null;
  }

  if (input.customerId) {
    const customer = await db.customer.findFirst({
      where: { id: input.customerId, tenantId, deletedAt: null },
      select: { defaultPriceListId: true },
    });
    if (!customer) throw new PriceListError("NOT_FOUND", "Cliente non trovato");
    if (customer.defaultPriceListId) {
      const list = await load(customer.defaultPriceListId);
      if (list && isUsable(list, at, input.currencyCode)) return list;
    }
  }

  const fallback = await db.priceList.findFirst({
    where: {
      tenantId,
      isDefault: true,
      active: true,
      ...(input.currencyCode ? { currencyCode: input.currencyCode } : {}),
    },
    select: LIST_SELECT,
  });
  return fallback && isUsable(fallback, at, input.currencyCode) ? fallback : null;
}

type ListRow = NonNullable<Awaited<ReturnType<typeof pickPriceList>>>;

/** Requested list followed by its usable ancestors (stops at the first unusable parent). */
async function loadChain(db: Db, tenantId: string, head: ListRow, at: Date): Promise<ListRow[]> {
  const chain: ListRow[] = [head];
  const seen = new Set([head.id]);
  let parentId = head.parentListId;

  while (parentId) {
    if (seen.has(parentId))
      throw new PriceListError("INVALID", "Rilevato ciclo nella gerarchia dei listini");
    if (chain.length >= MAX_PRICE_LIST_DEPTH)
      throw new PriceListError("INVALID", "Gerarchia dei listini troppo profonda");
    const parent = await db.priceList.findFirst({
      where: { id: parentId, tenantId },
      select: LIST_SELECT,
    });
    if (!parent || !isUsable(parent, at, head.currencyCode)) break;
    chain.push(parent);
    seen.add(parent.id);
    parentId = parent.parentListId;
  }
  return chain;
}

/**
 * Resolves the unit price of a variant following the guide (section 6):
 * list selection, quantity break and validity, own item first, then parent chain with strategy.
 * Rounding is applied once, only to computed prices, using the requested list's method.
 *
 * @param db - Prisma client or transaction client
 * @param tenantId - Current tenant
 * @param input - Validated resolver input
 * @returns Resolved price; source NONE (unitPrice null) when no price is available
 * @throws PriceListError for unknown entities, non-convertible UoM, cycles or excessive depth
 */
export async function resolveVariantPrice(
  db: Db,
  tenantId: string,
  input: ResolvePriceInput,
): Promise<ResolvedPrice> {
  const at = input.at ? new Date(input.at as string | Date) : new Date();

  const variant = await db.productVariant.findFirst({
    where: { id: input.variantId, tenantId, deletedAt: null },
    select: { id: true, productId: true, product: { select: { baseUomId: true } } },
  });
  if (!variant) throw new PriceListError("NOT_FOUND", "Product Variant non trovato");

  const factor = await resolveUomFactor(
    db,
    tenantId,
    { id: variant.productId, baseUomId: variant.product.baseUomId },
    input.uomId,
  );
  const baseQuantity = new Decimal(input.quantity ?? "1").times(factor);
  const none: ResolvedPrice = {
    source: PRICE_SOURCE.NONE,
    unitPrice: null,
    uomFactor: factor.toFixed(10),
  };

  const head = await pickPriceList(db, tenantId, input, at);
  if (!head) return none;

  const chain = await loadChain(db, tenantId, head, at);
  const rows = await db.priceListItem.findMany({
    where: { tenantId, variantId: variant.id, priceListId: { in: chain.map((l) => l.id) } },
    select: {
      id: true,
      priceListId: true,
      minQuantity: true,
      price: true,
      discountPercent: true,
      validFrom: true,
      validTo: true,
    },
  });
  const candidates = rows.map((r) => ({
    id: r.id,
    priceListId: r.priceListId,
    minQuantity: r.minQuantity.toString(),
    price: r.price.toString(),
    discountPercent: r.discountPercent?.toString() ?? null,
    validFrom: r.validFrom,
    validTo: r.validTo,
  }));

  for (let level = 0; level < chain.length; level++) {
    const item = selectPriceListItem(
      candidates.filter((c) => c.priceListId === chain[level].id),
      baseQuantity,
      at,
    );
    if (!item) continue;

    let price = new Decimal(item.price);
    if (level > 0) {
      for (let i = level - 1; i >= 0; i--) {
        price = applyPriceListStrategy(price, chain[i].strategy, chain[i].strategyValue.toString());
      }
      price = new Decimal(roundPrice(price, head.roundingMethod));
    }

    const basePrice = new Decimal(item.price); // price per base UoM

    const priceBeforeUom =
      level === 0
        ? basePrice
        : new Decimal(
            roundPrice(
              applyPriceListStrategy(
                basePrice,
                chain[level - 1].strategy,
                chain[level - 1].strategyValue.toString(),
              ),
              head.roundingMethod,
            ),
          );

    return {
      source: level === 0 ? PRICE_SOURCE.PRICE_LIST_ITEM : PRICE_SOURCE.DERIVED,
      unitPrice: priceBeforeUom.times(factor).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toFixed(6),
      uomFactor: factor.toFixed(10),
      priceListId: head.id,
      priceListItemId: item.id,
      appliedMinQuantity: item.minQuantity,
      discountPercent: item.discountPercent,
    };
  }
  return none;
}
