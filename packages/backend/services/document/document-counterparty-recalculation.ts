import type { Document, Prisma } from "@/generated/prisma/client";
import {
  DOCUMENTS_REQUIRING_CUSTOMER,
  DOCUMENTS_REQUIRING_SUPPLIER,
  isNonPricedLineType,
  type CreateDocumentLineInput,
} from "@mini-erp/shared";
import { NotFoundError, ValidationError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import type { DocumentCreateContext, DocumentLinePricingContext } from "@/types";
import { copyLine } from "./document-line-copy";
import { buildDocumentLine } from "./document-line-builder";
import { resolveDocumentLinePricing } from "./document-line-pricing-service";
import { resolveDocumentLinesTax } from "./document-line-tax-service";
import { recalculateDocumentTotals } from "./document-totals-service";

/** Defaults of the new counterparty used to recalculate a draft. */
interface CounterpartyDefaults {
  taxRuleId: number | null;
  paymentMethodId: string | null;
}

/** Loads the tax rule and payment method defaults of the document counterparty. */
async function loadCounterpartyDefaults(
  tx: Prisma.TransactionClient,
  document: Document,
): Promise<CounterpartyDefaults> {
  const { tenantId } = document;
  if (DOCUMENTS_REQUIRING_SUPPLIER.includes(document.documentType)) {
    if (!document.supplierId) throw new ValidationError("A supplier is required");
    const supplier = await tx.supplier.findFirst({
      where: withSoftDelete(
        withTenantId({ id: document.supplierId }, tenantId),
      ) as Prisma.SupplierWhereInput,
      select: { supplierTaxRuleId: true, paymentMethodId: true },
    });
    if (!supplier) throw new NotFoundError("Supplier not found");
    return { taxRuleId: supplier.supplierTaxRuleId, paymentMethodId: supplier.paymentMethodId };
  }
  if (!document.customerId) throw new ValidationError("A customer is required");
  const customer = await tx.customer.findFirst({
    where: withSoftDelete(
      withTenantId({ id: document.customerId }, tenantId),
    ) as Prisma.CustomerWhereInput,
    select: { customerTaxRuleId: true, paymentMethodId: true },
  });
  if (!customer) throw new NotFoundError("Customer not found");
  return { taxRuleId: customer.customerTaxRuleId, paymentMethodId: customer.paymentMethodId };
}

/** Keeps only the price, tax and total columns of a rebuilt line (fulfillment, kit and source links are untouched). */
function pickPricedColumns(
  c: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput,
): Prisma.DocumentLineUncheckedUpdateInput {
  return {
    unitPrice: c.unitPrice,
    originalUnitPrice: c.originalUnitPrice ?? null,
    priceOverrideReason: c.priceOverrideReason ?? null,
    discountAmount: c.discountAmount,
    lineTotal: c.lineTotal,
    taxRuleId: c.taxRuleId ?? null,
    taxPercent: c.taxPercent,
    taxAmount: c.taxAmount,
    lineTotalWithTax: c.lineTotalWithTax,
    vatNatureCode: c.vatNatureCode ?? null,
    vatNormReference: c.vatNormReference ?? null,
  } satisfies Prisma.DocumentLineUncheckedUpdateInput;
}

/**
 * Recalculates every priced line of a draft after its customer (sales) or supplier (purchases)
 * changed: VAT rule (counterparty rule, then product rule, then tenant default, else the current
 * one), list prices for the new customer (sales; manual and overridden prices are kept), line
 * totals and document totals. The caller must have locked the document and verified it is editable.
 * Fulfillment quantities, kit links and source links are never touched.
 *
 * @param args - Transaction client, the document AFTER the header update, and the context
 * @returns The payment method default of the new counterparty (null when it has none)
 * @throws NotFoundError when the counterparty does not exist for the tenant
 * @throws ValidationError when a line has no price or no usable tax rule (message names the line)
 */
export async function recalculateForCounterpartyChange(args: {
  tx: Prisma.TransactionClient;
  document: Document;
  context: DocumentCreateContext;
}): Promise<{ paymentMethodId: string | null }> {
  const { tx, document, context } = args;
  const { tenantId } = document;
  const purchase = DOCUMENTS_REQUIRING_SUPPLIER.includes(document.documentType);
  if (!purchase && !DOCUMENTS_REQUIRING_CUSTOMER.includes(document.documentType)) {
    return { paymentMethodId: document.paymentMethodId };
  }

  const defaults = await loadCounterpartyDefaults(tx, document);
  const tenant = await tx.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { defaultSalesTaxRuleId: true, defaultPurchasesTaxRuleId: true },
  });
  const tenantRuleId = purchase ? tenant.defaultPurchasesTaxRuleId : tenant.defaultSalesTaxRuleId;

  const lines = await tx.documentLine.findMany({
    where: { tenantId, documentId: document.id },
    orderBy: { lineNumber: "asc" },
  });
  const productIds = [
    ...new Set(lines.flatMap((line) => (line.productId ? [line.productId] : []))),
  ];
  const products = await tx.product.findMany({
    where: { tenantId, id: { in: productIds } },
    select: { id: true, defaultTaxRuleId: true },
  });
  const productRule = new Map(products.map((p) => [p.id, p.defaultTaxRuleId]));

  const pricingContext = {
    tenantId,
    documentType: document.documentType,
    currencyCode: document.currencyCode,
    documentDate: document.documentDate,
    customerId: document.customerId,
  } satisfies DocumentLinePricingContext;

  for (const line of lines) {
    if (isNonPricedLineType(line.lineType)) continue;
    try {
      const taxRuleId =
        defaults.taxRuleId ??
        (line.productId ? productRule.get(line.productId) : null) ??
        tenantRuleId ??
        line.taxRuleId;
      if (taxRuleId === null) throw new ValidationError("No tax rule available");

      const copy = copyLine({ ...line, taxRuleId }, line.quantity.toString());
      const listPriced = !purchase && line.productVariantId && line.priceOverrideReason === null;
      const pricing = listPriced
        ? await resolveDocumentLinePricing(tx, pricingContext, {
            ...copy.input,
            unitPrice: undefined,
          } as CreateDocumentLineInput)
        : copy.pricing;
      const [tax] = await resolveDocumentLinesTax(tx, pricingContext, [copy.input]);
      const { prismaInput } = buildDocumentLine({
        line: copy.input,
        index: line.lineNumber - 1,
        pricing,
        tax,
      });
      await tx.documentLine.update({
        where: { tenantId_id: { tenantId, id: line.id } },
        data: pickPricedColumns(prismaInput),
      });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw new ValidationError(`Line ${line.lineNumber}: ${error.message}`);
      }
      throw error;
    }
  }

  await recalculateDocumentTotals(tx, { documentId: document.id, tenantId }, context.userId);
  return { paymentMethodId: defaults.paymentMethodId };
}
