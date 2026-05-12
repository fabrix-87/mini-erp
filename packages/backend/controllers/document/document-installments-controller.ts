import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { sendCreated, sendDeleted, sendSuccess } from "@/utils/response-utils";
import {
  CreateInstallmentInput,
  DocumentIdParam,
  GenerateInstallmentPlanInput,
  InstallmentIdParam,
  PayInstallmentInput,
  UpdateInstallmentInput,
} from "@mini-erp/shared";
import { toIntId, withSoftDelete, toDecimal, parseOptionalDate } from "@/helpers/prisma-helper";
import { updateDocumentPaidAmount } from "@/services/document";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";

// ============================================================================
// INSTALLMENTS — READ
// ============================================================================

/**
 * Lists all payment installments for a document.
 * Returns installments ordered by installment number.
 * @route GET /api/documents/:id/installments
 * @access Private
 */
export const getDocumentInstallments = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const installments = await prisma.documentPaymentInstallment.findMany({
    where: { documentId: toIntId(id) },
    orderBy: { installmentNumber: "asc" },
  });

  return sendSuccess(c, installments, { results: installments.length });
};

/**
 * Returns a single installment by ID.
 * Verifies the installment belongs to the specified document.
 * @route GET /api/documents/:id/installments/:installmentId
 * @access Private
 */
export const getInstallmentById = async (c: Context<AppBindings>) => {
  const { id, installmentId } = getValidatedParams<InstallmentIdParam>(c);

  const installment = await prisma.documentPaymentInstallment.findUnique({
    where: { id: toIntId(installmentId, "installmentId") },
    include: { paymentMethod: true },
  });

  if (!installment) {
    throw new NotFoundError("Rata non trovata");
  }

  if (installment.documentId !== toIntId(id)) {
    throw new BadRequestError("La rata non appartiene a questo documento");
  }

  return sendSuccess(c, installment);
};

// ============================================================================
// INSTALLMENTS — WRITE
// ============================================================================

/**
 * Creates a new payment installment for a document.
 * Only DRAFT or PENDING_APPROVAL documents can receive new installments.
 * Automatically assigns the next installment number.
 * @route POST /api/documents/:id/installments
 * @access Private
 */
export const createInstallment = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<CreateInstallmentInput>(c);

  const documentId = toIntId(id);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: documentId }) as Prisma.DocumentWhereUniqueInput,
    select: {
      id: true,
      status: true,
      totalAmount: true,
      installments: { select: { installmentNumber: true } },
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  if (document.status !== "DRAFT" && document.status !== "PENDING_APPROVAL") {
    throw new BadRequestError("Impossibile aggiungere rate a un documento non in bozza");
  }

  const maxInstallmentNumber = document.installments.reduce(
    (max, inst) => Math.max(max, inst.installmentNumber),
    0,
  );

  const installment = await prisma.documentPaymentInstallment.create({
    data: {
      ...input,
      documentId,
      installmentNumber: maxInstallmentNumber + 1,
      dueDate: new Date(input.dueDate),
      amount: new Prisma.Decimal((input.amount ?? 0).toString()),
    percentage: new Prisma.Decimal((input.percentage ?? 0).toString()),
      paidAmount: new Prisma.Decimal(0),
      status: "PENDING",
    },
  });

  return sendCreated(c, installment, "Rata creata con successo");
};

/**
 * Updates an existing installment's metadata (due date, notes, payment terms).
 * Amount and percentage changes are only allowed on PENDING installments.
 * @route PUT /api/documents/:id/installments/:installmentId
 * @access Private
 */
export const updateInstallment = async (c: Context<AppBindings>) => {
  const { id, installmentId } = getValidatedParams<InstallmentIdParam>(c);
  const input = getValidatedBody<UpdateInstallmentInput>(c);

  const installmentIdInt = toIntId(installmentId, "installmentId");

  const existing = await prisma.documentPaymentInstallment.findUnique({
    where: { id: installmentIdInt },
    select: { documentId: true, status: true },
  });

  if (!existing) {
    throw new NotFoundError("Rata non trovata");
  }

  if (existing.documentId !== toIntId(id)) {
    throw new BadRequestError("La rata non appartiene a questo documento");
  }

  // Amount/percentage changes only allowed on PENDING installments
  const isAmountChange = input.amount !== undefined || input.percentage !== undefined;
  if (isAmountChange && existing.status !== "PENDING") {
    throw new BadRequestError(
      `Impossibile modificare l'importo di una rata con stato: ${existing.status}`,
    );
  }

  const updated = await prisma.documentPaymentInstallment.update({
    where: { id: installmentIdInt },
    data: {
      ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.percentage !== undefined && { percentage: input.percentage }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.paymentMethodId !== undefined && { paymentMethodId: input.paymentMethodId }),
    },
  });

  return sendSuccess(c, updated, { message: "Rata aggiornata con successo" });
};

/**
 * Deletes a payment installment.
 * Only PENDING installments on DRAFT documents can be deleted.
 * @route DELETE /api/documents/:id/installments/:installmentId
 * @access Private
 */
export const deleteInstallment = async (c: Context<AppBindings>) => {
  const { id, installmentId } = getValidatedParams<InstallmentIdParam>(c);

  const installmentIdInt = toIntId(installmentId, "installmentId");

  const installment = await prisma.documentPaymentInstallment.findUnique({
    where: { id: installmentIdInt },
    select: {
      documentId: true,
      status: true,
      document: { select: { status: true } },
    },
  });

  if (!installment) {
    throw new NotFoundError("Rata non trovata");
  }

  if (installment.documentId !== toIntId(id)) {
    throw new BadRequestError("La rata non appartiene a questo documento");
  }

  if (
    installment.document.status !== "DRAFT" &&
    installment.document.status !== "PENDING_APPROVAL"
  ) {
    throw new BadRequestError("Impossibile eliminare rate di un documento non in bozza");
  }

  if (installment.status !== "PENDING") {
    throw new BadRequestError(`Impossibile eliminare una rata con stato: ${installment.status}`);
  }

  await prisma.documentPaymentInstallment.delete({ where: { id: installmentIdInt } });

  return sendDeleted(c, "Rata eliminata");
};

// ============================================================================
// INSTALLMENTS — PAYMENT
// ============================================================================

/**
 * Records a payment against an installment.
 * Supports partial payments; status transitions automatically:
 * - paidAmount >= amount  → PAID
 * - 0 < paidAmount < amount → PARTIAL
 * Automatically updates the parent document's paidAmount aggregate.
 * @route POST /api/documents/:id/installments/:installmentId/pay
 * @access Private
 */
export const payInstallment = async (c: Context<AppBindings>) => {
  const { id, installmentId } = getValidatedParams<InstallmentIdParam>(c);
  const input = getValidatedBody<PayInstallmentInput>(c);

  const installmentIdInt = toIntId(installmentId, "installmentId");
  const documentId = toIntId(id);

  const installment = await prisma.documentPaymentInstallment.findUnique({
    where: { id: installmentIdInt },
    select: {
      documentId: true,
      status: true,
      amount: true,
      paidAmount: true,
    },
  });

  if (!installment) {
    throw new NotFoundError("Rata non trovata");
  }

  if (installment.documentId !== documentId) {
    throw new BadRequestError("La rata non appartiene a questo documento");
  }

  if (installment.status === "PAID") {
    throw new BadRequestError("La rata è già stata pagata completamente");
  }

  if (installment.status === "CANCELLED") {
    throw new BadRequestError("Impossibile registrare un pagamento su una rata annullata");
  }

  const paymentAmount = new Prisma.Decimal(input.paidAmount || 0);
  const newPaidAmount = installment.paidAmount.add(paymentAmount);
  const totalAmount = installment.amount;

  if (newPaidAmount.greaterThan(totalAmount)) {
    throw new BadRequestError(
      `Il pagamento (${input.paidAmount}) supera il residuo (${totalAmount.sub(installment.paidAmount)})`,
    );
  }

  // Determine new status
  const newStatus = newPaidAmount.greaterThanOrEqualTo(totalAmount) ? "PAID" : "PARTIAL";

  const updated = await prisma.$transaction(async (tx) => {
    const inst = await tx.documentPaymentInstallment.update({
      where: { id: installmentIdInt },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        ...(newStatus === "PAID" && {
          paidDate: new Date(input.paidDate),
        }),
        ...(input.paymentReference && { paymentReference: input.paymentReference }),
        ...(input.paymentMethodId && { paymentMethodId: input.paymentMethodId }),
        ...(input.bankTransactionId && { bankTransactionId: input.bankTransactionId }),
        ...(input.notes && { notes: input.notes }),
      },
    });

    // Sync parent document paidAmount aggregate
    await updateDocumentPaidAmount(documentId);

    return inst;
  });

  return sendSuccess(c, updated, {
    message: newStatus === "PAID" ? "Rata saldata completamente" : "Pagamento parziale registrato",
  });
};

// ============================================================================
// INSTALLMENTS — GENERATION
// ============================================================================

/**
 * Auto-generates a payment plan from the document's total amount.
 * Replaces any existing PENDING installments.
 * Distributes the total evenly; the last installment absorbs rounding differences.
 * @route POST /api/documents/:id/installments/generate
 * @access Private
 */
export const generateInstallmentPlan = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const body = getValidatedBody<GenerateInstallmentPlanInput>(c);

  const documentId = toIntId(id);

  if (body.count < 1 || body.count > 36) {
    throw new BadRequestError("Il numero di rate deve essere compreso tra 1 e 36");
  }

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: documentId }) as Prisma.DocumentWhereUniqueInput,
    select: {
      id: true,
      status: true,
      totalAmount: true,
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  if (document.status !== "DRAFT" && document.status !== "PENDING_APPROVAL") {
    throw new BadRequestError("Impossibile generare un piano rate su un documento non in bozza");
  }

  const total = document.totalAmount;
  const count = body.count;

  // Base amount per installment (truncated to 2 decimal places)
  const baseAmount = total.div(count).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
  // Last installment absorbs rounding remainder
  const lastAmount = total.sub(baseAmount.mul(count - 1));

  const firstDue = new Date(body.firstDueDate);

  await prisma.$transaction(async (tx) => {
    // Remove only PENDING installments — preserve any already PAID/PARTIAL
    await tx.documentPaymentInstallment.deleteMany({
      where: { documentId, status: "PENDING" },
    });

    // Find highest existing installment number (e.g. from already-paid ones)
    const existing = await tx.documentPaymentInstallment.findMany({
      where: { documentId },
      select: { installmentNumber: true },
      orderBy: { installmentNumber: "desc" },
    });
    const startNumber = existing.length > 0 ? existing[0].installmentNumber + 1 : 1;

    const installmentsData = Array.from({ length: count }, (_, i) => {
      const dueDate = new Date(firstDue);
      dueDate.setDate(dueDate.getDate() + i * body.intervalDays);

      const amount = i === count - 1 ? lastAmount : baseAmount;
      const percentage = amount.div(total).mul(100).toDecimalPlaces(2);

      return {
        documentId,
        installmentNumber: startNumber + i,
        amount,
        percentage,
        paidAmount: new Prisma.Decimal(0),
        dueDate,
        status: "PENDING" as const,
        paymentMethodId: body.paymentMethodId ?? null,
      };
    });

    await tx.documentPaymentInstallment.createMany({ data: installmentsData });
  });

  const installments = await prisma.documentPaymentInstallment.findMany({
    where: { documentId },
    orderBy: { installmentNumber: "asc" },
  });

  return sendSuccess(c, installments, {
    message: `Piano rate generato: ${count} rate da ${baseAmount} ${count > 1 ? `(ultima: ${lastAmount})` : ""}`,
    results: installments.length,
  });
};
