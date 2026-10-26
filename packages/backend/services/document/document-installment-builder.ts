import { Prisma } from "@/generated/prisma/client";
import type { CreateInstallmentInput } from "@mini-erp/shared";
import { toDecimal } from "@/helpers/prisma-helper";

/**
 * Builds a Prisma input for one payment installment.
 * `tenantId` is mandatory because DocumentPaymentInstallment is tenant-scoped.
 *
 * @param installment - Validated installment payload
 * @param tenantId - Current tenant ID
 * @returns Prisma input for nested creation
 */
export function buildDocumentInstallment(
  installment: CreateInstallmentInput,
  tenantId: string,
): Prisma.DocumentPaymentInstallmentUncheckedCreateWithoutDocumentInput {
  return {
    installmentNumber: installment.installmentNumber,
    percentage: installment.percentage,
    amount: toDecimal(installment.amount),
    dueDate: new Date(installment.dueDate),
    status: installment.status,
    notes: installment.notes ?? undefined,
    paymentMethodId: installment.paymentMethodId ?? undefined,
  };
}

/**
 * Builds all installment Prisma inputs for a document.
 *
 * @param installments - Validated installment payloads
 * @param tenantId - Current tenant ID
 * @returns Prisma inputs in the provided order
 */
export function buildDocumentInstallments(
  installments: CreateInstallmentInput[],
  tenantId: string,
): Prisma.DocumentPaymentInstallmentUncheckedCreateWithoutDocumentInput[] {
  return installments.map((installment) =>
    buildDocumentInstallment(installment, tenantId),
  );
}