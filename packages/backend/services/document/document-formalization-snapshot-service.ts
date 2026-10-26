import { DocumentType, Prisma } from "@/generated/prisma/client";
import { DOCUMENT_TYPE_CONFIG } from "@mini-erp/shared";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import type { DocumentCreateContext, DocumentFormalizationSnapshots } from "@/types";

/** Prisma transaction client used by the snapshot resolver. */
type TransactionClient = Prisma.TransactionClient;

/** Document data required to resolve formalization snapshots. */
export interface ResolveSnapshotsDocument {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  customerId: string | null;
  supplierId: string | null;
  shippingAddressId?: string | null;
  carrierId?: string | null;
  paymentMethodId: string | null;
  paymentBankAccountId: string | null;
  bankIban: string | null;
}

/**
 * Builds the TENANT party snapshot from the tenant legal company.
 *
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns TENANT party snapshot
 */
async function buildTenantParty(
  tenantId: string,
  tx: TransactionClient,
): Promise<Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput> {
  const tenant = await tx.tenant.findUnique({
    where: { id: tenantId },
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

  if (!tenant) {
    throw new NotFoundError("Tenant not found");
  }

  const company = tenant.company;
  const version = company.versions[0];

  return {
    role: "TENANT",
    name: version?.companyName ?? company.companyName,
    entityType: version?.entityType ?? company.entityType,
    legalForm: version?.legalForm ?? company.legalForm,
    vatNumber: version?.vatNumber ?? company.vatNumber,
    taxCode: version?.taxCode ?? company.taxCode,
    vatId: version?.vatId ?? company.vatId,
    eoriNumber: version?.eoriNumber ?? company.eoriNumber,
    taxRegime: tenant.taxRegime,
    pec: version?.pec ?? company.pec,
    sdiCode: version?.sdiCode ?? company.sdiCode,
    address: version?.address,
    city: version?.city,
    postalCode: version?.zipCode,
    province: version?.provinceCode,
    countryCode: version?.countryCode ?? company.countryCode,
    email: version?.mainEmail ?? company.mainEmail,
    phone: version?.mainPhone ?? company.mainPhone,
    reaOffice: version?.reaOffice ?? company.reaOffice,
    reaNumber: version?.reaNumber ?? company.reaNumber,
    reaShareCapital: version?.reaShareCapital ?? company.reaShareCapital,
    reaShareholderType: version?.reaShareholderType ?? company.reaShareholderType,
    reaLiquidationStatus: version?.reaLiquidationStatus ?? company.reaLiquidationStatus,
    sourceCompanyId: company.id,
    companyVersionId: version?.id,
  };
}

/**
 * Builds the COUNTERPARTY party snapshot from a Customer or Supplier.
 *
 * @param companyId - Company ID associated with the counterparty
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns COUNTERPARTY party snapshot
 */
async function buildCounterpartyParty(
  companyId: string,
  tenantId: string,
  tx: TransactionClient,
): Promise<Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput> {
  const company = await tx.company.findFirst({
    where: {
      tenantId,
      id: companyId,
    },
    include: {
      versions: {
        where: { isCurrent: true },
        take: 1,
      },
    },
  });

  if (!company) {
    throw new NotFoundError("Counterparty company not found");
  }

  const version = company.versions[0];

  return {
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
    reaOffice: version?.reaOffice ?? company.reaOffice,
    reaNumber: version?.reaNumber ?? company.reaNumber,
    reaShareCapital: version?.reaShareCapital ?? company.reaShareCapital,
    reaShareholderType: version?.reaShareholderType ?? company.reaShareholderType,
    reaLiquidationStatus: version?.reaLiquidationStatus ?? company.reaLiquidationStatus,
    sourceCompanyId: company.id,
    companyVersionId: version?.id,
  };
}

/**
 * Builds the SHIPPING party snapshot from a CompanyAddress.
 *
 * @param shippingAddressId - Selected shipping address ID
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns SHIPPING party snapshot
 */
async function buildShippingParty(
  shippingAddressId: string,
  counterpartyCompanyId: string,
  tenantId: string,
  tx: TransactionClient,
): Promise<Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput> {
  const address = await tx.companyAddress.findFirst({
    where: {
      id: shippingAddressId,
      companyId: counterpartyCompanyId,
      company: {
        tenantId,
      },
    },
    include: {
      company: {
        select: {
          companyName: true,
        },
      },
    },
  });

  if (!address) {
    throw new NotFoundError("Shipping address not found");
  }

  return {
    role: "SHIPPING",
    name: address.company.companyName,
    address: address.address,
    city: address.city,
    postalCode: address.zipCode,
    province: address.provinceCode,
    countryCode: address.countryCode,
    sourceAddressId: address.id,
    sourceCompanyId: address.companyId,
  };
}

/**
 * Builds the CARRIER party snapshot from a tenant Carrier.
 *
 * @param carrierId - Selected carrier ID
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns CARRIER party snapshot
 */
async function buildCarrierParty(
  carrierId: string,
  tenantId: string,
  tx: TransactionClient,
): Promise<Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput> {
  const carrier = await tx.carrier.findFirst({
    where: {
      tenantId,
      id: carrierId,
      deletedAt: null,
    },
    select: {
      code: true,
      name: true,
    },
  });

  if (!carrier) {
    throw new NotFoundError("Carrier not found");
  }

  return {
    role: "CARRIER",
    code: carrier.code,
    name: carrier.name,
  };
}

/**
 * Resolves the payment snapshot from a PaymentMethod.
 *
 * @param paymentMethodId - Selected payment method ID
 * @param tenantId - Current tenant ID
 * @param tx - Prisma transaction client
 * @returns Payment snapshot
 */
async function resolvePaymentSnapshot(
  paymentMethodId: string,
  tenantId: string,
  tx: TransactionClient,
): Promise<DocumentFormalizationSnapshots["payment"]> {
  const paymentMethod = await tx.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      OR: [{ tenantId }, { tenantId: null }],
      active: true,
    },
  });

  if (!paymentMethod) {
    throw new NotFoundError("Payment method not found");
  }

  return {
    paymentMethodCode: paymentMethod.code,
  };
}

/**
 * Resolves the bank snapshot from a BankAccount and evaluates the
 * anti-fraud mismatch for INBOUND supplier documents.
 *
 * @param args - Bank account, document and tenant context
 * @param args.bankAccountId - Selected bank account ID
 * @param args.tenantId - Current tenant ID
 * @param args.supplierId - Supplier ID, for INBOUND mismatch detection
 * @param args.currentIban - IBAN currently present on the document
 * @param args.tx - Prisma transaction client
 * @returns Bank snapshot and mismatch flag
 */
async function resolveBankSnapshot(args: {
  bankAccountId: string;
  tenantId: string;
  supplierId: string | null;
  currentIban: string | null;
  tx: TransactionClient;
}): Promise<DocumentFormalizationSnapshots["bank"]> {
  const { bankAccountId, tenantId, supplierId, currentIban, tx } = args;

  const bankAccount = await tx.bankAccount.findFirst({
    where: {
      tenantId,
      id: bankAccountId,
    },
  });

  if (!bankAccount) {
    throw new NotFoundError("Bank account not found");
  }

  const bankDetailsMismatch = await hasBankDetailsMismatch({
    tenantId,
    supplierId,
    currentIban: bankAccount.iban,
    tx,
  });

  return {
    bankName: bankAccount.bankName,
    bankIban: bankAccount.iban,
    bankSwift: bankAccount.bic ?? undefined,
    bankAccountHolder: bankAccount.accountHolder ?? undefined,
    paymentBankAccountId: bankAccount.id,
    bankDetailsMismatch,
  };
}

/**
 * Checks whether the IBAN differs from the IBAN used on the last registered
 * INBOUND document for the same supplier.
 *
 * @param args - Mismatch detection context
 * @param args.tenantId - Current tenant ID
 * @param args.supplierId - Supplier ID
 * @param args.currentIban - IBAN being snapshot
 * @param args.tx - Prisma transaction client
 * @returns True when the IBAN differs from the last registered INBOUND document
 */
async function hasBankDetailsMismatch(args: {
  tenantId: string;
  supplierId: string | null;
  currentIban: string;
  tx: TransactionClient;
}): Promise<boolean> {
  const { tenantId, supplierId, currentIban, tx } = args;

  if (!supplierId) {
    return false;
  }

  const lastRegisteredDocument = await tx.document.findFirst({
    where: {
      tenantId,
      supplierId,
      direction: "INBOUND",
      registrationDate: { not: null },
      bankIban: { not: null },
    },
    orderBy: {
      registrationDate: "desc",
    },
    select: {
      bankIban: true,
    },
  });

  if (!lastRegisteredDocument?.bankIban) {
    return false;
  }

  return lastRegisteredDocument.bankIban !== currentIban;
}

/**
 * Resolves all immutable snapshots required to formalize a document.
 * Must be called inside the same transaction that updates the document.
 *
 * @param document - Document being formalized
 * @param context - Tenant and authenticated user context
 * @param tx - Prisma transaction client
 * @returns Party, payment and bank snapshots
 */
export async function resolveDocumentFormalizationSnapshots(
  document: ResolveSnapshotsDocument,
  context: DocumentCreateContext,
  tx: TransactionClient,
): Promise<DocumentFormalizationSnapshots> {
  if (document.tenantId !== context.tenantId) {
    throw new BadRequestError("Document does not belong to the current tenant");
  }

  const documentConfig = DOCUMENT_TYPE_CONFIG[document.documentType];

  if (documentConfig.requiresPaymentMethod && !document.paymentMethodId) {
    throw new BadRequestError("Payment method is required to formalize this document type");
  }

  const parties: Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput[] = [];

  parties.push(await buildTenantParty(context.tenantId, tx));

  let counterpartyCompanyId: string | null = null;

  if (document.customerId) {
    const customer = await tx.customer.findFirst({
      where: {
        tenantId: context.tenantId,
        id: document.customerId,
        deletedAt: null,
      },
      select: {
        companyId: true,
      },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    counterpartyCompanyId = customer.companyId;

    parties.push(await buildCounterpartyParty(customer.companyId, context.tenantId, tx));
  }

  if (document.supplierId) {
    const supplier = await tx.supplier.findFirst({
      where: {
        tenantId: context.tenantId,
        id: document.supplierId,
        deletedAt: null,
      },
      select: {
        companyId: true,
      },
    });

    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    counterpartyCompanyId = supplier.companyId;

    parties.push(await buildCounterpartyParty(supplier.companyId, context.tenantId, tx));
  }

  if (document.shippingAddressId && !counterpartyCompanyId) {
    throw new BadRequestError("Shipping address requires a customer or supplier");
  }

  if (document.shippingAddressId && counterpartyCompanyId) {
    parties.push(
      await buildShippingParty(
        document.shippingAddressId,
        counterpartyCompanyId,
        context.tenantId,
        tx,
      ),
    );
  }

  if (document.carrierId) {
    parties.push(await buildCarrierParty(document.carrierId, context.tenantId, tx));
  }

  const payment = document.paymentMethodId
    ? await resolvePaymentSnapshot(document.paymentMethodId, context.tenantId, tx)
    : {
        paymentMethodCode: undefined,
      };

  const bank = document.paymentBankAccountId
    ? await resolveBankSnapshot({
        bankAccountId: document.paymentBankAccountId,
        tenantId: context.tenantId,
        supplierId: document.supplierId,
        currentIban: document.bankIban,
        tx,
      })
    : {
        bankDetailsMismatch: false,
      };

  return {
    parties,
    payment,
    bank,
  };
}
