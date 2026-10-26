import { Prisma } from "@/generated/prisma/client";
import type { CreateDocumentInput } from "@mini-erp/shared";
import { isInboundDocumentType } from "@mini-erp/shared";
import type { DocumentCreateContext, DocumentCreateSnapshots } from "./types";

/** Prisma transaction client accepted by the snapshot resolver. */
type TransactionClient = Prisma.TransactionClient;

/**
 * Resolves server-owned snapshots for a new document.
 * This function must be called inside the same transaction that creates the document.
 *
 * The exact projection depends on the current Customer, Supplier, Company,
 * CompanyAddress, PaymentMethod, BankAccount and WithholdingTaxType models.
 *
 * @param input - Validated document creation payload
 * @param context - Tenant and authenticated user
 * @param tx - Prisma transaction client
 * @returns Party, payment, bank and fiscal snapshots
 */
/**
 * Resolves server-owned snapshots for a new document.
 * Must be called inside the same transaction that creates the document.
 *
 * @param input - Validated document creation payload
 * @param context - Tenant and authenticated user context
 * @param tx - Prisma transaction client
 * @returns Party, payment and bank snapshots
 */
export async function resolveDocumentCreateSnapshots(
  input: CreateDocumentInput,
  context: DocumentCreateContext,
  tx: Prisma.TransactionClient,
): Promise<DocumentCreateSnapshots> {
  const parties: Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput[] = [];

  if (input.customerId) {
    const customer = await tx.customer.findFirst({
      where: {
        tenantId: context.tenantId,
        id: input.customerId,
        deletedAt: null,
      },
      include: {
        company: {
          include: {
            versions: {
              where: { isCurrent: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const company = customer.company;
    const version = company.versions[0];

    parties.push({
      role: "COUNTERPARTY",
      name: version?.companyName ?? company.companyName,
      entityType: version?.entityType ?? company.entityType,
      legalForm: version?.legalForm ?? company.legalForm,
      vatNumber: version?.vatNumber ?? company.vatNumber,
      taxCode: version?.taxCode ?? company.taxCode,
      vatId: version?.vatId ?? company.vatId,
      eoriNumber: version?.eoriNumber ?? company.eoriNumber,
      pec: version?.pec ?? company.pec,
      sdiCode: version?.sdiCode ?? company.sdiCode,
      address: version?.address,
      city: version?.city,
      postalCode: version?.zipCode,
      province: version?.provinceCode,
      countryCode: version?.countryCode ?? company.countryCode,
      email: version?.mainEmail ?? company.mainEmail,
      phone: version?.mainPhone ?? company.mainPhone,
      sourceCompanyId: company.id,
      companyVersionId: version?.id,
    });
  }

  if (input.supplierId) {
    const supplier = await tx.supplier.findFirst({
      where: {
        tenantId: context.tenantId,
        id: input.supplierId,
        deletedAt: null,
      },
      include: {
        company: {
          include: {
            versions: {
              where: { isCurrent: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    const company = supplier.company;
    const version = company.versions[0];

    parties.push({
      role: "COUNTERPARTY",
      name: version?.companyName ?? company.companyName,
      entityType: version?.entityType ?? company.entityType,
      legalForm: version?.legalForm ?? company.legalForm,
      vatNumber: version?.vatNumber ?? company.vatNumber,
      taxCode: version?.taxCode ?? company.taxCode,
      vatId: version?.vatId ?? company.vatId,
      eoriNumber: version?.eoriNumber ?? company.eoriNumber,
      pec: version?.pec ?? company.pec,
      sdiCode: version?.sdiCode ?? company.sdiCode,
      address: version?.address,
      city: version?.city,
      postalCode: version?.zipCode,
      province: version?.provinceCode,
      countryCode: version?.countryCode ?? company.countryCode,
      email: version?.mainEmail ?? company.mainEmail,
      phone: version?.mainPhone ?? company.mainPhone,
      sourceCompanyId: company.id,
      companyVersionId: version?.id,
    });
  }

  const payment = await resolvePaymentSnapshot(input, context.tenantId, tx);
  const bank = await resolveBankSnapshot(input, context.tenantId, tx);

  return {
    parties,
    payment,
    bank,
  };
}

/**
 * Resolves the immutable payment snapshot from a tenant PaymentMethod.
 *
 * @param paymentMethodId - Selected payment method ID
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns Payment method code and terms label
 */
/**
 * Resolves the payment snapshot for a new document.
 * When paymentMethodId is provided, paymentMethodCode is copied from PaymentMethod.
 * The installment schedule is not generated here: it requires document totals.
 *
 * @param input - Validated document creation payload
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns Payment snapshot
 */
async function resolvePaymentSnapshot(
  input: CreateDocumentInput,
  tenantId: string,
  tx: Prisma.TransactionClient,
): Promise<DocumentCreateSnapshots["payment"]> {
  if (!input.paymentMethodId) {
    if (!input.paymentMethodCode) {
      throw new Error("paymentMethodCode is required when paymentMethodId is not provided");
    }

    return {
      paymentMethodCode: input.paymentMethodCode,
    };
  }

  const paymentMethod = await tx.paymentMethod.findFirst({
    where: {
      id: input.paymentMethodId,
      OR: [{ tenantId }, { tenantId: null }],
      active: true,
    },
  });

  if (!paymentMethod) {
    throw new Error("Payment method not found");
  }

  return {
    paymentMethodCode: paymentMethod.code,
  };
}

/**
 * Resolves the immutable bank snapshot from a tenant BankAccount.
 *
 * @param input - Validated document creation payload
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns Bank snapshot
 */
async function resolveBankSnapshot(
  input: CreateDocumentInput,
  tenantId: string,
  tx: Prisma.TransactionClient,
): Promise<DocumentCreateSnapshots["bank"]> {
  if (!input.paymentBankAccountId) {
    return {
      bankName: input.bankName ?? undefined,
      bankIban: input.bankIban ?? undefined,
      bankSwift: input.bankSwift ?? undefined,
      bankAccountHolder: input.bankAccountHolder ?? undefined,
      bankDetailsMismatch: false,
    };
  }

  const bankAccount = await tx.bankAccount.findFirst({
    where: {
      tenantId,
      id: input.paymentBankAccountId,
    },
  });

  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  return {
    bankName: bankAccount.bankName,
    bankIban: bankAccount.iban,
    bankSwift: bankAccount.bic ?? undefined,
    bankAccountHolder: bankAccount.accountHolder ?? undefined,
    paymentBankAccountId: bankAccount.id,
    bankDetailsMismatch: false,
  };
}
