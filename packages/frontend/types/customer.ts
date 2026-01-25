export type { Customer, CustomerStats } from "@mini-erp/shared/types";

export type {
  CustomerType,
  CustomerPriority,
  CustomerSegment,
  LeadStatus,
  CreditCheckStatus,
  CustomerSize,
} from "@mini-erp/shared/constants";

import { CustomerQueryInput as BaseQuery } from "@mini-erp/shared/types";

export type CustomerQueryInput = Omit<
  BaseQuery,
  "leadStatus" | "type" | "segment"
> & {
  // Ridefinisco ogni campo recuperando il tipo originale e aggiungendo "all"
  leadStatus?: BaseQuery["leadStatus"] | "all";
  type?: BaseQuery["type"] | "all";
  segment?: BaseQuery["segment"] | "all";
};
