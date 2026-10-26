import { CompanyTypeEntity, Decimal } from "../../constants";
import { BankAccount } from "../bank";
import { Carrier } from "../carrier";
import { Contact } from "../contact";
import { Currency } from "../currency";
import { Customer } from "../customer";
import { IntrastatTransaction } from "../intrastat";
import { Lead } from "../lead";
import { Opportunity } from "../opportunity";
import { PaymentMethod } from "../payment";
import { Product, ProductVariant } from "../product";
import { Supplier } from "../supplier";
import { TaxRule } from "../tax";
import { User } from "../user";
import { StockMovement, StockReservation, Warehouse } from "../warehouse";
import {
  DocumentDirection,
  DocumentLineType,
  DocumentPartyRole,
  DocumentRelationType,
  DocumentStatus,
  DocumentType,
  InstallmentStatus,
  MatchStatus,
} from "./enum";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Document-owned party snapshot. One row per document and role.
 * Output (PDF, XML) must read these values, never the live source records.
 */
export type DocumentParty = {
  tenantId: string;
  documentId: string;
  role: DocumentPartyRole;
  code: string | null;
  name: string;
  entityType: CompanyTypeEntity | null;
  legalForm: string | null;
  vatNumber: string | null;
  taxCode: string | null;
  vatId: string | null;
  eoriNumber: string | null;
  taxRegime: string | null;
  pec: string | null;
  sdiCode: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  countryCode: string | null;
  email: string | null;
  phone: string | null;
  reaOffice: string | null;
  reaNumber: string | null;
  reaShareCapital: Decimal | null;
  reaShareholderType: "SU" | "SM" | null;
  reaLiquidationStatus: "LS" | "LN" | null;
  sourceCompanyId: string | null;
  sourceAddressId: string | null;
  companyVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Document line entity. */
export type DocumentLine = {
  id: string;
  tenantId: string;
  documentId: string;
  document?: Document;
  productVariantId: string | null;
  productVariant?: ProductVariant | null;
  productId: string | null;
  product?: Product | null;
  lineNumber: number;
  lineType: DocumentLineType;
  code: string | null;
  nameSystem: string;
  descriptionSystem: string | null;
  nameCustomer: string | null;
  descriptionCustomer: string | null;
  quantity: Decimal;
  unit: string;
  unitPrice: Decimal;
  unitCost: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  lineTotal: Decimal;
  taxRuleId: number | null;
  taxRule?: TaxRule | null;
  taxPercent: Decimal;
  taxAmount: Decimal;
  vatNatureCode: string | null;
  vatNormReference: string | null;
  isReverseCharge: boolean;
  isSelfInvoice: boolean;
  /** Only populated on SUPPLIER_INVOICE lines. */
  matchStatus: MatchStatus | null;
  lineTotalWithTax: Decimal;
  notes: string | null;
  customFields: Record<string, unknown> | null;
  intrastatTransactions?: IntrastatTransaction[];
  warehouseId: string | null;
  warehouse?: Warehouse | null;
  stockReservations?: StockReservation[];
  stockMovements?: StockMovement[];
  parentLineId: string | null;
  parentLine?: DocumentLine | null;
  componentLines?: DocumentLine[];
  isComponent: boolean;
  quantityInvoiced: Decimal;
  quantityDelivered: Decimal;
  quantityReturned: Decimal;
  originalUnitPrice: Decimal | null;
  priceOverrideReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Payment installment entity. */
export type DocumentPaymentInstallment = {
  id: string;
  tenantId: string;
  documentId: string;
  document?: Document;
  installmentNumber: number;
  percentage: Decimal;
  amount: Decimal;
  dueDate: Date;
  paidDate: Date | null;
  paidAmount: Decimal;
  status: InstallmentStatus;
  notes: string | null;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentReference: string | null;
  bankTransactionId: string | null;
  paymentBatchId: string | null;
  remindersSent: number;
  lastReminderAt: Date | null;
  lateFeeAmount: Decimal;
  createdAt: Date;
  updatedAt: Date;
};

/** Append-only audit record of a document status transition. */
export type DocumentStatusHistory = {
  id: number;
  documentId: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  changedBy: string;
  user?: User;
  reason: string | null;
  changedAt: Date;
};

/** Document entity. Party identity and addresses live in `parties`. */
export type Document = {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  direction: DocumentDirection;

  // Outbound numbering
  documentNumber: string | null;
  sequenceNumber: number | null;
  documentYear: number;
  // Inbound numbering
  counterpartyDocumentNumber: string | null;
  // VAT register
  vatRegisterProtocol: number | null;
  vatRegisterYear: number | null;

  // Counterparties
  customerId: string | null;
  customer?: Customer | null;
  supplierId: string | null;
  supplier?: Supplier | null;
  contactId: string | null;
  contact?: Contact | null;
  opportunityId: string | null;
  opportunity?: Opportunity | null;
  leadId: string | null;
  lead?: Lead | null;
  warehouseId: string | null;
  warehouse?: Warehouse | null;
  parties?: DocumentParty[];

  // Dates
  documentDate: Date;
  dueDate: Date | null;
  deliveryDate: Date | null;
  validUntil: Date | null;
  sentDate: Date | null;
  receivedDate: Date | null;
  registrationDate: Date | null;

  // Relations
  relatedDocuments?: DocumentRelation[];
  relatedToDocuments?: DocumentRelation[];

  // Amounts (document currency)
  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  shippingCost: Decimal;
  shippingTaxAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
  netPayableAmount: Decimal;
  paidAmount: Decimal;
  currencyCode: string;
  currency?: Currency;
  exchangeRate: Decimal;
  exchangeRateDate: Date;
  baseCurrencyCode: string;

  // Logistics
  carrierId: string | null;
  carrier?: Carrier | null;
  trackingNumber: string | null;

  // Payment snapshot
  paymentMethodId: string | null;
  paymentMethodRel?: PaymentMethod | null;
  paymentMethodCode: string;
  paymentTermsLabel: string | null;

  // Bank snapshot (source of truth for payment execution)
  bankName: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  bankAccountHolder: string | null;
  /** Traceability only: never read it to execute a payment. */
  paymentBankAccountId: string | null;
  paymentBankAccount?: BankAccount | null;
  bankDetailsMismatch: boolean;
  bankDetailsVerifiedByUserId: string | null;
  bankDetailsVerifiedAt: Date | null;

  // Notes
  notes: string | null;
  internalNotes: string | null;
  termsAndConditions: string | null;

  // Withholding tax and social security (INBOUND)
  withholdingTaxTypeId: string | null;
  withholdingTaxTypeCode: string | null;
  withholdingTaxBase: Decimal | null;
  withholdingTaxPercent: Decimal | null;
  withholdingTaxAmount: Decimal | null;
  contributionPercent: Decimal | null;
  contributionAmount: Decimal | null;

  // Ownership
  createdByUserId: string;
  createdBy?: User;
  assignedUserId: string | null;
  assignedUser?: User | null;
  deletedBy: string | null;
  deletedByUser?: User | null;

  customFields: Record<string, unknown> | null;
  statusHistory?: DocumentStatusHistory[];

  // Lifecycle timestamps
  approvedAt: Date | null;
  invoicedAt: Date | null;
  deliveredAt: Date | null;
  closedAt: Date | null;
  voidedAt: Date | null;
  voidedReason: string | null;
  snapshotLockedAt: Date | null;

  lines?: DocumentLine[];
  installments?: DocumentPaymentInstallment[];
  stockMovements?: StockMovement[];
  stockReservations?: StockReservation[];
  intrastatTransactions?: IntrastatTransaction[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/** Per-tenant, per-type, per-year sequence counter. */
export type DocumentSequence = {
  id: number;
  tenantId: string;
  documentType: DocumentType;
  year: number;
  lastNumber: number;
  prefix: string | null;
  updatedAt: Date;
};

/** Directed edge between two documents. */
export type DocumentRelation = {
  sourceDocumentId: string;
  sourceDocument?: Document;
  targetDocumentId: string;
  targetDocument?: Document;
  relationType: DocumentRelationType;
  createdAt: Date;
};

/**
 * Document with full details
 */
export type DocumentComplete = Document & {
  lines: DocumentLine[];
  installments: DocumentPaymentInstallment[];
  relatedDocuments: DocumentRelation[];
  stockMovements: StockMovement[];
};
