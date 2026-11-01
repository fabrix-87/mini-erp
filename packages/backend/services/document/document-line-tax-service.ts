import { DOCUMENTS_REQUIRING_SUPPLIER, type CreateDocumentLineInput } from "@mini-erp/shared";
import type { Db } from "@/helpers/pricelist-helper";
import type { DocumentLinePricingContext, ResolvedLineTax } from "@/types";
import { ValidationError } from "@/utils/app-error-utils";

const NO_TAX: ResolvedLineTax = {
  taxRuleId: null,
  taxPercent: "0",
  vatNatureCode: null,
  vatNormReference: null,
};

/**
 * Resolves the VAT snapshot of document lines from their tax rules, with one query for all lines.
 * Descriptive lines have no VAT. A rule must be global or owned by the tenant, active, valid on
 * the document date and applicable to the document flow (sales or purchases).
 * Split payment and reverse charge are NOT derived from the rule yet.
 *
 * @param db - Prisma client or transaction client
 * @param context - Document pricing context
 * @param lines - Validated line payloads
 * @returns Tax snapshots in the same order as `lines`
 * @throws ValidationError when a rule is not usable for this document
 */
export async function resolveDocumentLinesTax(
  db: Db,
  context: DocumentLinePricingContext,
  lines: CreateDocumentLineInput[],
): Promise<ResolvedLineTax[]> {
  const ruleIds = new Set<number>();
  for (const line of lines) if ("taxRuleId" in line) ruleIds.add(line.taxRuleId);

  const purchase = DOCUMENTS_REQUIRING_SUPPLIER.includes(context.documentType);
  const rules =
    ruleIds.size === 0
      ? []
      : await db.taxRule.findMany({
          where: {
            id: { in: [...ruleIds] },
            active: true,
            applicableFor: { in: purchase ? ["PURCHASES", "BOTH"] : ["SALES", "BOTH"] },
            AND: [
              { OR: [{ tenantId: null }, { tenantId: context.tenantId }] },
              { validFrom: { lte: context.documentDate } },
              { OR: [{ validTo: null }, { validTo: { gte: context.documentDate } }] },
            ],
          },
          select: {
            id: true,
            rate: true,
            normativeReference: true,
            vatNature: { select: { code: true } },
          },
        });
  const byId = new Map(rules.map((rule) => [rule.id, rule]));

  return lines.map((line) => {
    if (!("taxRuleId" in line)) return NO_TAX;
    const rule = byId.get(line.taxRuleId);
    if (!rule)
      throw new ValidationError(`Tax rule ${line.taxRuleId} is not valid for this document`);
    if (rule.rate.isZero() && !rule.vatNature) {
      throw new ValidationError(`Tax rule ${line.taxRuleId} has a zero rate without a VAT nature`);
    }
    return {
      taxRuleId: rule.id,
      taxPercent: rule.rate.toString(),
      vatNatureCode: rule.vatNature?.code ?? null,
      vatNormReference: rule.normativeReference,
    };
  });
}
