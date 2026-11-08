import type { Document, PaymentTermType, Prisma } from "@/generated/prisma/client";
import { Decimal, roundCurrency } from "@mini-erp/shared";
import { ValidationError } from "@/utils/app-error-utils";

/** One payment term rule of a payment method. */
export interface TermRule {
  termType: PaymentTermType;
  dueDays: number;
  fixedDay: number | null;
  fixedMonthOffset: number;
  percentage: { toString(): string };
}

/** An installment before persistence. */
export interface PlannedInstallment {
  dueDate: Date;
  amount: Decimal;
  percentage: Decimal;
  paymentMethodId?: string | null;
  notes?: string | null;
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/** Last day of the month of `date` (UTC). */
const endOfMonth = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

/**
 * Computes the due date of one term from the document date (UTC calendar days).
 * END_OF_MONTH is the end of the month of (document date + dueDays)
 * FIXED_DAY is the given day of the month offset by fixedMonthOffset, clamped to the month length.
 */
export function calculateDueDate(term: TermRule, base: Date): Date {
  switch (term.termType) {
    case "ANTICIPATED":
      return base;
    case "DAYS_FROM_INVOICE":
      return addDays(base, term.dueDays);
    case "END_OF_MONTH":
      return endOfMonth(addDays(base, term.dueDays));
    case "FIXED_DAY": {
      const month = new Date(
        Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + term.fixedMonthOffset, 1),
      );
      const last = endOfMonth(month).getUTCDate();
      return new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), Math.min(term.fixedDay ?? 1, last)),
      );
    }
  }
}

/**
 * Builds the installment plan of a payable document from the terms of a payment method.
 * Without terms the whole amount is due on the document date. Amounts are rounded to cents and the
 * last term absorbs the rounding difference; the result is sorted by due date.
 *
 * @throws ValidationError when the term percentages do not add up to 100
 */
export function buildInstallmentPlan(args: {
  terms: TermRule[];
  baseDate: Date;
  total: Decimal;
}): PlannedInstallment[] {
  const { terms, baseDate, total } = args;
  if (terms.length === 0) {
    return [{ dueDate: baseDate, amount: total, percentage: new Decimal(100) }];
  }
  const percentages = terms.map((term) => new Decimal(term.percentage.toString()));
  if (!percentages.reduce((sum, p) => sum.plus(p), new Decimal(0)).equals(100)) {
    throw new ValidationError("The payment method terms must add up to 100%");
  }

  let allocated = new Decimal(0);
  const plan = terms.map((term, index) => {
    const last = index === terms.length - 1;
    const amount = last
      ? total.minus(allocated)
      : roundCurrency(total.times(percentages[index]).div(100));
    allocated = allocated.plus(amount);
    return { dueDate: calculateDueDate(term, baseDate), amount, percentage: percentages[index] };
  });
  return plan.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/**
 * Replaces every installment of a draft with `plan` (already sorted by due date) and aligns
 * Document.dueDate with the first due date. The caller has verified the document is editable.
 */
export async function replaceInstallments(
  tx: Prisma.TransactionClient,
  document: Pick<Document, "id" | "tenantId">,
  plan: PlannedInstallment[],
): Promise<void> {
  const { id: documentId, tenantId } = document;
  await tx.documentPaymentInstallment.deleteMany({ where: { tenantId, documentId } });
  if (plan.length > 0) {
    await tx.documentPaymentInstallment.createMany({
      data: plan.map((item, index) => ({
        tenantId,
        documentId,
        installmentNumber: index + 1,
        percentage: item.percentage.toFixed(2),
        amount: item.amount.toFixed(2),
        dueDate: item.dueDate,
        status: "PENDING" as const,
        paymentMethodId: item.paymentMethodId ?? null,
        notes: item.notes ?? null,
      })),
    });
  }
  await tx.document.update({
    where: { tenantId_id: { tenantId, id: documentId } },
    data: { dueDate: plan[0]?.dueDate ?? null },
  });
}

/**
 * Rescales the installments of a draft to a new net payable amount, keeping their proportions;
 * the last installment absorbs the rounding difference. A zero amount removes the plan.
 * Called whenever the document totals change.
 */
export async function realignDraftInstallments(
  tx: Prisma.TransactionClient,
  target: { documentId: string; tenantId: string; netPayable: Decimal },
): Promise<void> {
  const { documentId, tenantId, netPayable } = target;
  const installments = await tx.documentPaymentInstallment.findMany({
    where: { tenantId, documentId },
    orderBy: { installmentNumber: "asc" },
  });
  if (installments.length === 0) return;

  const oldTotal = installments.reduce((sum, i) => sum.plus(i.amount.toString()), new Decimal(0));
  if (oldTotal.equals(netPayable)) return;
  if (netPayable.isZero() || oldTotal.isZero()) {
    await replaceInstallments(tx, { id: documentId, tenantId }, []);
    return;
  }

  let allocated = new Decimal(0);
  for (const [index, installment] of installments.entries()) {
    const last = index === installments.length - 1;
    const amount = last
      ? netPayable.minus(allocated)
      : roundCurrency(new Decimal(installment.amount.toString()).times(netPayable).div(oldTotal));
    allocated = allocated.plus(amount);
    await tx.documentPaymentInstallment.update({
      where: { tenantId_id: { tenantId, id: installment.id } },
      data: { amount: amount.toFixed(2) },
    });
  }
}
