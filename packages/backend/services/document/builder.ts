// ============================================================================
// DOCUMENT DATA BUILDER SERVICE
// Builds Prisma-compatible UncheckedCreateInput from validated controller input.
// Always uses direct FK fields (UncheckedCreateInput) — never nested connect.
// ============================================================================

import { Prisma } from "@/generated/prisma/client";
import {
  type CreateDocumentInput,
  type CreateInstallmentInput,
  type DocumentStatus,
  type DocumentType,
  calculateLineTotals,
  calculateDocumentTotals,
  STATUSES_REQUIRING_NUMBER,
  UpdateDocumentInput,
} from "@mini-erp/shared";
import { generateDocumentNumber } from "./numbering";
import { Decimal } from "@prisma/client/runtime/client";
import { toJsonField } from "@/helpers/prisma-helper";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Minimal line shape required by calculateDocumentTotals.
 * Used as intermediate result before building Prisma input.
 */
interface LineTotalsSnapshot {
  lineTotal: Decimal;
  taxAmount: Decimal;
}

/**
 * Intermediate line representation: computed totals + full Prisma input.
 * Keeps the two concerns separate without duplicating fields.
 */
interface ProcessedLine {
  totals: LineTotalsSnapshot;
  prismaInput: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput;
}

/**
 * Validated input for updating a document.
 * All fields are optional except the document ID (passed separately).
 * Lines and installments, if provided, fully replace the existing ones.
 */
export interface UpdateDocumentPayload {
  lines?: CreateDocumentInput["lines"];
  installments?: CreateInstallmentInput[];
  [key: string]: unknown;
}

// ============================================================================
// LINE BUILDER
// ============================================================================

/**
 * Processes a raw CreateDocumentLineInput into computed totals + Prisma input.
 * Separates calculateLineTotals output (numbers) from the Prisma write type.
 *
 * @param line - Raw input line from validated request
 * @param index - Zero-based index used to compute lineNumber
 * @returns ProcessedLine with totals (for calculateDocumentTotals) and prismaInput (for create)
 */
export function buildDocumentLine(
  line: CreateDocumentInput["lines"][number],
  index: number,
): ProcessedLine {
  const raw = calculateLineTotals(
    line.quantity,
    line.unitPrice,
    line.discountPercent ?? 0,
    line.taxPercent ?? 22,
  );

  const lineTotal = new Decimal(raw.lineTotal);
  const taxAmount = new Decimal(raw.taxAmount);

  return {
    // Used only by calculateDocumentTotals — always defined, correct type
    totals: { lineTotal, taxAmount },

    // Used by Prisma tx.document.create — fully typed UncheckedCreateInput
    prismaInput: {
      lineNumber: index + 1,
      lineType: line.lineType ?? "product",
      code: line.code ?? null,
      productId: line.productId ?? null,
      productVariantId: line.productVariantId ?? null,
      nameSystem: line.nameSystem,
      descriptionSystem: line.descriptionSystem ?? null,
      nameCustomer: line.nameCustomer ?? null,
      descriptionCustomer: line.descriptionCustomer ?? null,
      quantity: Number(line.quantity),
      unit: line.unit ?? "pz",
      unitPrice: Number(line.unitPrice),
      unitCost: Number(line.unitCost ?? 0),
      discountPercent: Number(line.discountPercent ?? 0),
      discountAmount: new Decimal(raw.discountAmount),
      lineTotal,
      taxRuleId: line.taxRuleId ?? null,
      taxPercent: Number(line.taxPercent ?? 22),
      taxAmount,
      vatNatureCode: line.vatNatureCode ?? null,
      vatNormReference: line.vatNormReference ?? null,
      lineTotalWithTax: new Decimal(raw.lineTotalWithTax),
      quantityInvoiced: new Decimal(0),
      quantityDelivered: new Decimal(0),
      quantityReturned: new Decimal(0),
      notes: line.notes ?? null,
      customFields: toJsonField(line.customFields),
      warehouseId: line.warehouseId ?? null,
      parentLineId: line.parentLineId ?? null,
      isComponent: line.isComponent ?? false,
      originalUnitPrice: line.originalUnitPrice ? Number(line.originalUnitPrice) : null,
      priceOverrideReason: line.priceOverrideReason ?? null,
    },
  };
}

// ============================================================================
// DOCUMENT DATA BUILDER
// ============================================================================

export async function buildDocumentCreateData(
  input: CreateDocumentInput,
  userId: number,
  tx: Prisma.TransactionClient,
): Promise<Prisma.DocumentUncheckedCreateInput> {
  const { lines = [], installments = [], ...documentData } = input;
  const currentYear = new Date().getFullYear();

  // ── Numbering ────────────────────────────────────────────────────────────
  let documentNumber: string | null = null;
  let sequenceNumber: number | null = null;

  if (
    documentData.status !== "DRAFT" &&
    STATUSES_REQUIRING_NUMBER.includes(documentData.status as DocumentStatus)
  ) {
    const generated = await generateDocumentNumber(
      documentData.documentType as DocumentType,
      currentYear,
      tx,
    );
    documentNumber = generated.documentNumber;
    sequenceNumber = generated.sequenceNumber;
  }

  // ── Lines ────────────────────────────────────────────────────────────────
  // Step 1: build both totals snapshots and Prisma inputs in one pass
  const processedLines = lines.map((line, index) => buildDocumentLine(line, index));

  // Step 2: extract totals snapshots for calculateDocumentTotals
  //         type is always { lineTotal: Decimal; taxAmount: Decimal } — no undefined
  const lineTotalsForCalc = processedLines.map((pl) => pl.totals);

  // Step 3: extract Prisma inputs for the nested create
  const prismaLines = processedLines.map((pl) => pl.prismaInput);

  // ── Document Totals ──────────────────────────────────────────────────────
  const totals =
    lineTotalsForCalc.length > 0
      ? calculateDocumentTotals(
          lineTotalsForCalc,
          documentData.discountPercent ?? 0,
          documentData.shippingCost ?? 0,
        )
      : {
          subtotal: new Decimal(0),
          discountAmount: new Decimal(0),
          taxableAmount: new Decimal(0),
          taxAmount: new Decimal(0),
          shippingTaxAmount: new Decimal(0),
          totalAmount: new Decimal(0),
        };

  // ── Installments ─────────────────────────────────────────────────────────
  const installmentsCreate: Prisma.DocumentPaymentInstallmentUncheckedCreateWithoutDocumentInput[] =
    installments.map((inst: CreateInstallmentInput) => ({
      installmentNumber: inst.installmentNumber,
      percentage: Number(inst.percentage ?? 0),
      amount: Number(inst.amount),
      dueDate: inst.dueDate ? new Date(inst.dueDate) : new Date(),
      status: inst.status ?? "PENDING",
      notes: inst.notes ?? null,
      paidAmount: 0,
      remindersSent: 0,
      lateFeeAmount: 0,
    }));

  // ── Return UncheckedCreateInput ───────────────────────────────────────────
  return {
    documentType: documentData.documentType,
    status: documentData.status ?? "DRAFT",
    documentNumber,
    sequenceNumber,
    documentYear: currentYear,
    documentDate: new Date(documentData.documentDate ?? new Date()),
    dueDate: documentData.dueDate ? new Date(documentData.dueDate) : null,
    deliveryDate: documentData.deliveryDate ? new Date(documentData.deliveryDate) : null,
    validUntil: documentData.validUntil ? new Date(documentData.validUntil) : null,
    companyId: documentData.companyId,
    customerId: documentData.customerId ?? null,
    supplierId: documentData.supplierId ?? null,
    contactId: documentData.contactId ?? null,
    opportunityId: documentData.opportunityId ?? null,
    leadId: documentData.leadId ?? null,
    warehouseId: documentData.warehouseId ?? null,
    paymentMethodId: documentData.paymentMethodId ?? null,
    assignedUserId: documentData.assignedUserId ?? null,
    createdByUserId: userId,
    parentDocumentId: documentData.parentDocumentId ?? null,
    customerName: documentData.customerName || "",
    customerVatNumber: documentData.customerVatNumber ?? null,
    customerTaxCode: documentData.customerTaxCode ?? null,
    customerPec: documentData.customerPec ?? null,
    customerSdiCode: documentData.customerSdiCode ?? null,
    customerAddress: documentData.customerAddress ?? null,
    customerCity: documentData.customerCity ?? null,
    customerPostalCode: documentData.customerPostalCode ?? null,
    customerProvince: documentData.customerProvince ?? null,
    customerCountryCode: documentData.customerCountryCode || "IT",
    customerEmail: documentData.customerEmail ?? null,
    customerPhone: documentData.customerPhone ?? null,
    shippingName: documentData.shippingName ?? null,
    shippingAddress: documentData.shippingAddress ?? null,
    shippingCity: documentData.shippingCity ?? null,
    shippingPostalCode: documentData.shippingPostalCode ?? null,
    shippingProvince: documentData.shippingProvince ?? null,
    shippingCountryCode: documentData.shippingCountryCode ?? null,
    discountPercent: Number(documentData.discountPercent ?? 0),
    shippingCost: Number(documentData.shippingCost ?? 0),
    currencyCode: documentData.currencyCode || "EUR",
    exchangeRate: Number(documentData.exchangeRate ?? 1),
    exchangeRateDate: documentData.exchangeRateDate
      ? new Date(documentData.exchangeRateDate)
      : new Date(),
    baseCurrencyCode: documentData.baseCurrencyCode || "EUR",
    paymentMethod: documentData.paymentMethod ?? "bank_transfer",
    paymentTerms: documentData.paymentTerms ?? null,
    bankName: documentData.bankName ?? null,
    bankIban: documentData.bankIban ?? null,
    bankSwift: documentData.bankSwift ?? null,
    notes: documentData.notes ?? null,
    internalNotes: documentData.internalNotes ?? null,
    termsAndConditions: documentData.termsAndConditions ?? null,
    customFields: toJsonField(documentData.customFields),
    // Spread calculated totals (subtotal, discountAmount, taxableAmount, taxAmount, shippingTaxAmount, totalAmount)
    ...totals,
    // Nested creates — Prisma injects documentId automatically
    ...(prismaLines.length > 0 && {
      lines: { create: prismaLines },
    }),
    ...(installmentsCreate.length > 0 && {
      installments: { create: installmentsCreate },
    }),
  };
}

// ============================================================================
// DOCUMENT UPDATE BUILDER
// ============================================================================

/**
 * Builds a Prisma DocumentUncheckedUpdateInput from a partial validated payload.
 * Lines and installments are intentionally excluded (managed via dedicated endpoints).
 * Only fields explicitly present in the payload are included (true partial update).
 * Totals are NOT recalculated here — use the recalculate endpoint if needed.
 *
 * @param payload - Validated UpdateDocumentInput (all fields optional)
 * @returns Prisma.DocumentUncheckedUpdateInput ready for tx.document.update()
 */
export function buildDocumentUpdateData(
  payload: UpdateDocumentInput,
): Prisma.DocumentUncheckedUpdateInput {
  const update: Prisma.DocumentUncheckedUpdateInput = {};

  // Helper to set only if value is explicitly present in the payload
  const set = <K extends keyof Prisma.DocumentUncheckedUpdateInput>(
    key: K,
    value: Prisma.DocumentUncheckedUpdateInput[K],
  ) => {
    update[key] = value;
  };

  if (payload.status !== undefined) set("status", payload.status);
  if (payload.statusCategory !== undefined) set("statusCategory", payload.statusCategory);
  if (payload.documentDate !== undefined) set("documentDate", new Date(payload.documentDate ?? ''));
  if (payload.dueDate !== undefined)
    set("dueDate", payload.dueDate ? new Date(payload.dueDate) : null);
  if (payload.deliveryDate !== undefined)
    set("deliveryDate", payload.deliveryDate ? new Date(payload.deliveryDate) : null);
  if (payload.validUntil !== undefined)
    set("validUntil", payload.validUntil ? new Date(payload.validUntil) : null);
  if (payload.exchangeRateDate !== undefined)
    set(
      "exchangeRateDate",
      payload.exchangeRateDate ? new Date(payload.exchangeRateDate) : new Date(),
    );

  // FK relations — direct IDs only
  if (payload.customerId !== undefined) set("customerId", payload.customerId ?? null);
  if (payload.supplierId !== undefined) set("supplierId", payload.supplierId ?? null);
  if (payload.contactId !== undefined) set("contactId", payload.contactId ?? null);
  if (payload.opportunityId !== undefined) set("opportunityId", payload.opportunityId ?? null);
  if (payload.leadId !== undefined) set("leadId", payload.leadId ?? null);
  if (payload.warehouseId !== undefined) set("warehouseId", payload.warehouseId ?? null);
  if (payload.paymentMethodId !== undefined)
    set("paymentMethodId", payload.paymentMethodId ?? null);
  if (payload.assignedUserId !== undefined) set("assignedUserId", payload.assignedUserId ?? null);
  if (payload.parentDocumentId !== undefined)
    set("parentDocumentId", payload.parentDocumentId ?? null);

  // Customer snapshot
  if (payload.customerName !== undefined) set("customerName", payload.customerName);
  if (payload.customerVatNumber !== undefined)
    set("customerVatNumber", payload.customerVatNumber ?? null);
  if (payload.customerTaxCode !== undefined)
    set("customerTaxCode", payload.customerTaxCode ?? null);
  if (payload.customerPec !== undefined) set("customerPec", payload.customerPec ?? null);
  if (payload.customerSdiCode !== undefined)
    set("customerSdiCode", payload.customerSdiCode ?? null);
  if (payload.customerAddress !== undefined)
    set("customerAddress", payload.customerAddress ?? null);
  if (payload.customerCity !== undefined) set("customerCity", payload.customerCity ?? null);
  if (payload.customerPostalCode !== undefined)
    set("customerPostalCode", payload.customerPostalCode ?? null);
  if (payload.customerProvince !== undefined)
    set("customerProvince", payload.customerProvince ?? null);
  if (payload.customerCountryCode !== undefined)
    set("customerCountryCode", payload.customerCountryCode);
  if (payload.customerEmail !== undefined) set("customerEmail", payload.customerEmail ?? null);
  if (payload.customerPhone !== undefined) set("customerPhone", payload.customerPhone ?? null);

  // Shipping
  if (payload.shippingName !== undefined) set("shippingName", payload.shippingName ?? null);
  if (payload.shippingAddress !== undefined)
    set("shippingAddress", payload.shippingAddress ?? null);
  if (payload.shippingCity !== undefined) set("shippingCity", payload.shippingCity ?? null);
  if (payload.shippingPostalCode !== undefined)
    set("shippingPostalCode", payload.shippingPostalCode ?? null);
  if (payload.shippingProvince !== undefined)
    set("shippingProvince", payload.shippingProvince ?? null);
  if (payload.shippingCountryCode !== undefined)
    set("shippingCountryCode", payload.shippingCountryCode ?? null);

  // Financials
  if (payload.discountPercent !== undefined)
    set("discountPercent", Number(payload.discountPercent));
  if (payload.shippingCost !== undefined) set("shippingCost", Number(payload.shippingCost));
  if (payload.currencyCode !== undefined) set("currencyCode", payload.currencyCode);
  if (payload.exchangeRate !== undefined) set("exchangeRate", Number(payload.exchangeRate));
  if (payload.baseCurrencyCode !== undefined) set("baseCurrencyCode", payload.baseCurrencyCode);

  // Payment
  if (payload.paymentMethod !== undefined) set("paymentMethod", payload.paymentMethod);
  if (payload.paymentTerms !== undefined) set("paymentTerms", payload.paymentTerms ?? null);
  if (payload.bankName !== undefined) set("bankName", payload.bankName ?? null);
  if (payload.bankIban !== undefined) set("bankIban", payload.bankIban ?? null);
  if (payload.bankSwift !== undefined) set("bankSwift", payload.bankSwift ?? null);

  // Notes
  if (payload.notes !== undefined) set("notes", payload.notes ?? null);
  if (payload.internalNotes !== undefined) set("internalNotes", payload.internalNotes ?? null);
  if (payload.termsAndConditions !== undefined)
    set("termsAndConditions", payload.termsAndConditions ?? null);
  if (payload.customFields !== undefined) set("customFields", toJsonField(payload.customFields));

  return update;
}
