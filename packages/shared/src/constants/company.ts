import { z } from "zod";
import {
  companySortFieldSchema,
  companyStatusSchema,
  companyTypeEntitySchema,
} from "../validators";
import { ADDRESS_TYPE } from "./address";
import { CompanyFormValues } from "../types";
import {
  CUSTOMER_CREDIT_CHECK_STATUS,
  CUSTOMER_PRIORITY,
  CUSTOMER_SEGMENT,
  CUSTOMER_SIZE,
  CUSTOMER_TYPE,
} from "./customer";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CompanyStatus = z.infer<typeof companyStatusSchema>;
export type CompanyTypeEntity = z.infer<typeof companyTypeEntitySchema>;
export type CompanySortField = z.infer<typeof companySortFieldSchema>;

export const COMPANY_STATUS = {
  ARCHIVED: "ARCHIVED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export const COMPANY_TYPE_ENTITY = {
  JURIDICAL: "JURIDICAL",
  NATURAL: "NATURAL",
  FOREIGN: "FOREIGN",
} as const;

export const COMPANY_SORT_FIELDS = [
  "id",
  "code",
  "name",
  "country",
  "status",
  "createdAt",
] as const;

/**
 * Maps the commercial role of a company to its generated code prefix.
 * @example COMPANY_CODE_PREFIX_MAP["customer"] // → "CLI"
 */
export const COMPANY_CODE_PREFIX_MAP = {
  lead: "LEA",
  prospect: "PRO",
  customer: "CLI",
  partner: "PAR",
  supplier: "SUP",
} as const satisfies Record<string, string>;

export type CompanyEntityKey = keyof typeof COMPANY_CODE_PREFIX_MAP;
export type CompanyCodePrefix = (typeof COMPANY_CODE_PREFIX_MAP)[CompanyEntityKey];

/** Default values aligned with Zod defaults — use in useForm({ defaultValues }) */
export const companyFormDefaultValues: CompanyFormValues = {
  companyName: "",
  tradeName: null,
  legalForm: null,
  status: COMPANY_STATUS.ACTIVE,
  entityType: COMPANY_TYPE_ENTITY.JURIDICAL,
  vatNumber: undefined,
  taxCode: undefined,
  sdiCode: undefined,
  pec: null,
  vatId: undefined,
  eoriNumber: undefined,
  countryCode: "IT",
  mainEmail: null,
  mainPhone: null,
  assignedUserId: null,
  customFields: null,
  legalAddress: {
    address: "",
    city: "",
    provinceCode: "",
    zipCode: "",
    countryCode: "IT",
    openingHours: null,
    phone: null,
    addressType: ADDRESS_TYPE.LEGAL,
    isPrimary: true,
    latitude: null,
    longitude: null,
    notes: null,
  },
  parentCustomerId: null,
  priority: CUSTOMER_PRIORITY.LOW,
  segment: CUSTOMER_SEGMENT.STANDARD,
  size: CUSTOMER_SIZE.SMALL,
  type: CUSTOMER_TYPE.CUSTOMER,
  creditStatus: CUSTOMER_CREDIT_CHECK_STATUS.PENDING,
  defaultPriceListId: null,
  customerTaxRuleId: null,
  paymentMethodId: null,
  parentSupplierId: null,
  paymentTerms: null,
  bankAccounts: [],
  leadTimeDays: 0,
  transportCost: null,
  rating: 5,
  supplierTaxRuleId: null,
  creditLimit: null,
};
