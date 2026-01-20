export type { 
  CustomerType, 
  CustomerPriority,
  CustomerSegment,
  LeadStatus,
  CreditCheckStatus,
  CustomerSize,
  Customer,
  CustomerStats
} from '@mini-erp/shared/types'

import { CustomerQueryInput as BaseQuery } from '@mini-erp/shared/types'

export type CustomerQueryInput = Omit<BaseQuery, 'leadStatus' | 'type' | 'segment'> & {
  // Ridefinisci ogni campo recuperando il tipo originale e aggiungendo "all"
  leadStatus?: BaseQuery['leadStatus'] | "all";
  type?: BaseQuery['type'] | "all";
  segment?: BaseQuery['segment'] | "all";
  
};