import { z } from "zod";
import { companyStatusSchema, companyTypeEntitySchema } from "../validators";
import { AddressType } from "./address";
import { CompanyFormValues } from "../types";
import { CreditCheckStatus, CustomerPriority, CustomerSegment, CustomerSize, CustomerType } from "./customer";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CompanyStatus = z.infer<typeof companyStatusSchema>;
export type CompanyTypeEntity = z.infer<typeof companyTypeEntitySchema>;

export const CompanyStatus = companyStatusSchema.enum;
export const CompanyTypeEntity = companyTypeEntitySchema.enum;

/** Default values aligned with Zod defaults — use in useForm({ defaultValues }) */
export const companyFormDefaultValues: CompanyFormValues = {
  companyName: "",
  tradeName: null,
  legalForm: null,
  status: CompanyStatus.ACTIVE,
  entityType: CompanyTypeEntity.JURIDICAL,
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
    addressType: AddressType.LEGAL,
    isPrimary: true,
    latitude: null,
    longitude: null,
    notes: null,
  },
  parentCustomerId: null,
  priority: CustomerPriority.LOW,
  segment: CustomerSegment.STANDARD,
  size: CustomerSize.SMALL,
  type: CustomerType.CUSTOMER,
  creditStatus: CreditCheckStatus.PENDING,
  defaultPriceListId: null,
  customerTaxRuleId: null,
  paymentMethodId: null,
  parentSupplierId: null,
  paymentTerms: null,
  bankAccount: null,
  leadTimeDays: 0,
  transportCost: null,
  rating: 5,
  supplierTaxRuleId: null,
  creditLimit: null,
};
