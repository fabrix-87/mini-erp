import { Prisma, type Document } from "@/generated/prisma/client";
import {
  Decimal,
  roundCurrency,
  canTransition,
  type GenerateInstallmentsInput,
  type PayInstallmentInput,
  type ReplaceInstallmentsInput,
  PAYABLE_DOCUMENT_TYPES,
  PAYABLE_STATUSES,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { TRANSACTION_LIMITS_OPTIONS, type DocumentCreateContext } from "@/types";
import { assertDocumentEditable, findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { createStatusHistory } from "./document-status-history";
import {
  buildInstallmentPlan,
  replaceInstallments,
  type TermRule,
} from "./document-installment-plan";

const dec = (value: { toString(): string }) => new Decimal(value.toString());

/** Calendar day of `now` in the fiscal time zone, as UTC midnight (due dates are stored that way). */
function todayInDocumentTimeZone(now = new Date()): Date {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Runs an installment transaction and maps constraint violations to AppErrors. */
async function runInstallmentTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(fn, TRANSACTION_LIMITS_OPTIONS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new BadRequestError("A referenced record is not valid for this document");
    }
    throw error;
  }
}

/** Loads a payable draft, locks it and rejects documents that cannot carry installments. */
async function loadEditablePayableDocument(
  tx: Prisma.TransactionClient,
  documentId: string,
  context: DocumentCreateContext,
): Promise<Document> {
  const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
  if (!PAYABLE_DOCUMENT_TYPES.includes(document.documentType)) {
    throw new BadRequestError(
      "Installments are only managed on invoices, debit notes and supplier invoices",
    );
  }
  assertDocumentEditable(document);
  await lockDocumentStatus(tx, document);
  return document;
}

/** Verifies that every payment method is global or owned by the tenant, and active. */
async function assertPaymentMethodsUsable(
  tx: Prisma.TransactionClient,
  tenantId: string,
  ids: string[],
): Promise<void> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return;
  const found = await tx.paymentMethod.count({
    where: { id: { in: unique }, active: true, OR: [{ tenantId: null }, { tenantId }] },
  });
  if (found !== unique.length) throw new NotFoundError("Payment method not found");
}

/** Loads the term rules of a usable payment method, ordered by position. */
async function loadPaymentTerms(
  tx: Prisma.TransactionClient,
  tenantId: string,
  paymentMethodId: string,
): Promise<TermRule[]> {
  await assertPaymentMethodsUsable(tx, tenantId, [paymentMethodId]);
  return tx.paymentTermDetail.findMany({
    where: { paymentMethodId },
    orderBy: { position: "asc" },
    select: {
      termType: true,
      dueDays: true,
      fixedDay: true,
      fixedMonthOffset: true,
      percentage: true,
    },
  });
}

/**
 * Lists the installments of a document.
 * @throws NotFoundError when the document does not exist
 */
export async function listDocumentInstallments(documentId: string, tenantId: string) {
  const document = await prisma.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
    select: { id: true },
  });
  if (!document) throw new NotFoundError("Document not found");
  return prisma.documentPaymentInstallment.findMany({
    where: { tenantId, documentId },
    orderBy: { installmentNumber: "asc" },
  });
}

/**
 * Generates the installment plan of a payable draft from a payment method, replacing the current
 * plan. When `paymentMethodId` is given and differs from the document's, the document is updated.
 * @throws NotFoundError | BadRequestError | ValidationError
 */
export async function generateDocumentInstallments(args: {
  documentId: string;
  input: GenerateInstallmentsInput;
  context: DocumentCreateContext;
}) {
  const { documentId, input, context } = args;
  return runInstallmentTransaction(async (tx) => {
    const document = await loadEditablePayableDocument(tx, documentId, context);
    const methodId = input.paymentMethodId ?? document.paymentMethodId;
    if (!methodId)
      throw new BadRequestError("A payment method is required to generate installments");

    const terms = await loadPaymentTerms(tx, document.tenantId, methodId);
    const plan = buildInstallmentPlan({
      terms,
      baseDate: document.documentDate,
      total: dec(document.netPayableAmount),
    });
    await replaceInstallments(
      tx,
      document,
      plan.map((item) => ({ ...item, paymentMethodId: methodId })),
    );
    if (methodId !== document.paymentMethodId) {
      await tx.document.update({
        where: { tenantId_id: { tenantId: document.tenantId, id: document.id } },
        data: {
          paymentMethodId: methodId,
          paymentMethodCode: null,
          updatedByUserId: context.userId,
        },
      });
    }
    return tx.documentPaymentInstallment.findMany({
      where: { tenantId: document.tenantId, documentId },
      orderBy: { installmentNumber: "asc" },
    });
  });
}

/**
 * Replaces the whole installment plan of a payable draft. The amounts must add up to the net
 * payable amount; percentages are derived from the amounts.
 * @throws NotFoundError | BadRequestError | ValidationError
 */
export async function replaceDocumentInstallments(args: {
  documentId: string;
  input: ReplaceInstallmentsInput;
  context: DocumentCreateContext;
}) {
  const { documentId, input, context } = args;
  return runInstallmentTransaction(async (tx) => {
    const document = await loadEditablePayableDocument(tx, documentId, context);
    const total = dec(document.netPayableAmount);
    const requested = input.installments.map((item) => ({
      ...item,
      amount: new Decimal(item.amount),
    }));

    const sum = requested.reduce((acc, item) => acc.plus(item.amount), new Decimal(0));
    if (!sum.equals(total)) {
      throw new ValidationError(
        `Installments total ${sum.toFixed(2)} differs from the net payable amount ${total.toFixed(2)}`,
      );
    }
    await assertPaymentMethodsUsable(
      tx,
      document.tenantId,
      requested.flatMap((item) => (item.paymentMethodId ? [item.paymentMethodId] : [])),
    );

    const plan = requested
      .map((item) => ({
        dueDate: new Date(item.dueDate),
        amount: item.amount,
        percentage: roundCurrency(item.amount.times(100).div(total)),
        paymentMethodId: item.paymentMethodId,
        notes: item.notes,
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    await replaceInstallments(tx, document, plan);
    return tx.documentPaymentInstallment.findMany({
      where: { tenantId: document.tenantId, documentId },
      orderBy: { installmentNumber: "asc" },
    });
  });
}

/**
 * Derives the payment state of a document from its installments, inside the caller's transaction:
 * paidAmount is the sum of the installments, and the status follows (PAID when all installments
 * are paid, OVERDUE when one is overdue, PARTIALLY_PAID when something is paid, else UNPAID) only
 * if the transition map of the document type allows it. The caller must have locked the document.
 */
export async function syncDocumentPaymentStatus(args: {
  tx: Prisma.TransactionClient;
  document: Document;
  context: DocumentCreateContext;
}): Promise<void> {
  const { tx, document, context } = args;
  const installments = await tx.documentPaymentInstallment.findMany({
    where: { tenantId: document.tenantId, documentId: document.id, status: { not: "CANCELLED" } },
    select: { status: true, paidAmount: true },
  });
  const paidAmount = installments.reduce(
    (sum, i) => sum.plus(i.paidAmount.toString()),
    new Decimal(0),
  );
  const allPaid = installments.length > 0 && installments.every((i) => i.status === "PAID");
  const target = allPaid
    ? "PAID"
    : installments.some((i) => i.status === "OVERDUE")
      ? "OVERDUE"
      : paidAmount.greaterThan(0)
        ? "PARTIALLY_PAID"
        : "UNPAID";
  const move =
    target !== document.status && canTransition(document.documentType, document.status, target);

  await tx.document.update({
    where: { tenantId_id: { tenantId: document.tenantId, id: document.id } },
    data: {
      paidAmount: paidAmount.toFixed(2),
      updatedByUserId: context.userId,
      ...(move && { status: target }),
    },
  });
  if (move) {
    await createStatusHistory({
      documentId: document.id,
      fromStatus: document.status,
      toStatus: target,
      context,
      reason: "Payment status derived from installments",
      tx,
    });
  }
}

/**
 * Registers a payment on an installment of an UNPAID, PARTIALLY_PAID or OVERDUE document and
 * updates the document payment state, all in one transaction. `expectedPaidAmount` must equal the
 * installment's current paid amount (duplicate or stale submissions get a 409).
 * A partially paid installment past its due date stays OVERDUE.
 *
 * @returns The updated installment
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function registerInstallmentPayment(args: {
  documentId: string;
  installmentId: string;
  input: PayInstallmentInput;
  context: DocumentCreateContext;
}) {
  const { documentId, installmentId, input, context } = args;
  return runInstallmentTransaction(async (tx) => {
    const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
    if (!PAYABLE_DOCUMENT_TYPES.includes(document.documentType)) {
      throw new BadRequestError(`${document.documentType} documents do not receive payments`);
    }
    if (!PAYABLE_STATUSES.includes(document.status)) {
      throw new BadRequestError(`A document in status ${document.status} cannot receive payments`);
    }
    await lockDocumentStatus(tx, document);

    const installment = await tx.documentPaymentInstallment.findFirst({
      where: { id: installmentId, tenantId: document.tenantId, documentId },
    });
    if (!installment) throw new NotFoundError("Installment not found");
    if (installment.status === "PAID" || installment.status === "CANCELLED") {
      throw new BadRequestError(
        `An installment in status ${installment.status} cannot receive payments`,
      );
    }
    if (installment.paymentBatchId) {
      throw new BadRequestError("The installment belongs to a payment batch");
    }
    if (!dec(installment.paidAmount).equals(input.expectedPaidAmount)) {
      throw new ConflictError("The installment was modified, reload it and retry");
    }
    if (input.paymentMethodId) {
      await assertPaymentMethodsUsable(tx, document.tenantId, [input.paymentMethodId]);
    }

    const newPaid = dec(installment.paidAmount).plus(input.paidAmount);
    const due = dec(installment.amount);
    if (newPaid.greaterThan(due)) {
      throw new BadRequestError(
        `The payment exceeds the remaining ${due.minus(installment.paidAmount.toString()).toFixed(2)}`,
      );
    }
    const status = newPaid.equals(due)
      ? "PAID"
      : installment.dueDate < todayInDocumentTimeZone()
        ? "OVERDUE"
        : "PARTIAL";

    const updated = await tx.documentPaymentInstallment.update({
      where: { tenantId_id: { tenantId: document.tenantId, id: installment.id } },
      data: {
        paidAmount: newPaid.toFixed(2),
        status,
        paidDate: new Date(input.paidDate),
        paymentMethodId: input.paymentMethodId ?? undefined,
        paymentReference: input.paymentReference ?? undefined,
        bankTransactionId: input.bankTransactionId ?? undefined,
      },
    });
    await syncDocumentPaymentStatus({ tx, document, context });
    return updated;
  });
}

/**
 * Generates the installments of a payable document at formalization when it has none, from its
 * payment method (a single installment due on the document date when the method has no terms).
 * Zero-amount documents get no installments. Runs inside the formalization transaction.
 */
export async function ensureInstallmentsOnFormalization(args: {
  document: Document;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { document, tx } = args;
  if (!PAYABLE_DOCUMENT_TYPES.includes(document.documentType)) return;
  const total = dec(document.netPayableAmount);
  if (total.isZero()) return;
  const existing = await tx.documentPaymentInstallment.count({
    where: { tenantId: document.tenantId, documentId: document.id },
  });
  if (existing > 0) return;

  const terms = document.paymentMethodId
    ? await loadPaymentTerms(tx, document.tenantId, document.paymentMethodId)
    : [];
  const plan = buildInstallmentPlan({ terms, baseDate: document.documentDate, total });
  await replaceInstallments(
    tx,
    document,
    plan.map((item) => ({ ...item, paymentMethodId: document.paymentMethodId })),
  );
}

/**
 * Marks as OVERDUE the open installments whose due date has passed and re-derives the payment
 * state of their documents. Meant to run once a day; each document is processed in its own
 * transaction. `systemUserId` is recorded in the status history.
 *
 * @returns Number of documents and installments updated
 */
export async function markOverdueInstallments(args: {
  systemUserId: string;
  asOf?: Date;
}): Promise<{ documents: number; installments: number }> {
  const today = todayInDocumentTimeZone(args.asOf);
  const candidates = await prisma.documentPaymentInstallment.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL"] },
      dueDate: { lt: today },
      document: { deletedAt: null, status: { in: [...PAYABLE_STATUSES] } },
    },
    select: { id: true, tenantId: true, documentId: true },
  });

  const byDocument = new Map<string, { tenantId: string; ids: string[] }>();
  for (const { id, tenantId, documentId } of candidates) {
    const entry = byDocument.get(documentId) ?? { tenantId, ids: [] };
    entry.ids.push(id);
    byDocument.set(documentId, entry);
  }

  let installments = 0;
  for (const [documentId, { tenantId, ids }] of byDocument) {
    installments += await prisma.$transaction(async (tx) => {
      const document = await findDocumentOrThrow(tx, documentId, tenantId);
      if (!PAYABLE_STATUSES.includes(document.status)) return 0;
      await lockDocumentStatus(tx, document);
      const { count } = await tx.documentPaymentInstallment.updateMany({
        where: { tenantId, documentId, id: { in: ids }, status: { in: ["PENDING", "PARTIAL"] } },
        data: { status: "OVERDUE" },
      });
      await syncDocumentPaymentStatus({
        tx,
        document,
        context: { tenantId, userId: args.systemUserId },
      });
      return count;
    }, TRANSACTION_LIMITS_OPTIONS);
  }
  return { documents: byDocument.size, installments };
}
