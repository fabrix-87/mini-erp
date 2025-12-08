import { Address } from "./address"

export interface Company {
  id: number
  type: 'lead' | 'prospect' | 'customer' | 'partner' | 'supplier'
  code: string
  companyName: string
  tradeName: string
  legalForm: string
  vatNumber: string
  taxCode: string
  sdiCode: string
  pecEmail: string
  reaNumber: string
  shareCapital: number
  industry: string
  subIndustry: string
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  employeesCount: number
  annualRevenue: number
  active: boolean
  isBlacklisted: boolean
  creditCheckStatus?: 'not_checked' | 'pending' | 'approved' | 'rejected'
  primaryEmail: string
  primaryPhone: string
  website: string
  linkedinUrl: string
  facebookUrl: string
  instagramUrl: string
  legalAddress: string
  legalCity: string
  legalPostalCode: string
  legalProvince: string
  legalCountry: string
  paymentTermDays: number
  paymentMethod?: 'bank_transfer' | 'credit_card' | 'paypal' | 'cash' | 'check' | 'other'
  creditLimit: number
  currentDebt: number
  discountPercent: number
  customerPriority?: 'low' | 'medium' | 'high'
  leadSource: string  
  leadStatus?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  leadScore: number
  leadQualifiedDate?: string
  leadConvertedDate?: string
  assignedUserId: number
  referredByCompanyId?: number
  firstContactDate?: string
  customerSegment?: 'vip' | 'gold' | 'silver' | 'bronze' | 'standard'
  firstOrderDate?: string
  lastOrderDate?: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue?: number
  description?: string
  internalNotes?: string
  createdAt: string
  updatedAt?: string
  logoUrl?: string
  customFields?: { [key: string]: any }
  contacts?: Array<{
    id: number
    firstName: string
    lastName: string
    isPrimary: boolean
  }>
  addresses?: Address[]
  activities?: any[]
  opportunities?: any[]
}

export interface CompanyDashboardStats {
  totalCompanies: number
  totalLeads: number
  totalCustomers: number
  newThisMonth: number
  leadsConvertedThisMonth: number
}

export const typeColors: Record<string, string> = {
  lead: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  prospect: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  customer: 'bg-green-500/10 text-green-700 dark:text-green-400',
  partner: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  supplier: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
}

export const leadStatusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700',
  contacted: 'bg-purple-500/10 text-purple-700',
  qualified: 'bg-cyan-500/10 text-cyan-700',
  proposal: 'bg-yellow-500/10 text-yellow-700',
  negotiation: 'bg-orange-500/10 text-orange-700',
  closed_won: 'bg-green-500/10 text-green-700',
  closed_lost: 'bg-red-500/10 text-red-700',
}

export interface companyFilters {
  page?: number;
  limit?: number;
  active?: boolean;
  leadStatus?: string;
  customerSegment?: string;
  search?: string;
  sortBy?: 'companyName' | 'createdAt' | 'type';
  sortOrder?: 'ASC' | 'DESC';
}
   

export interface FormData {
  type: 'lead' | 'prospect' | 'customer' | 'partner' | 'supplier'
  companyName: string
  tradeName: string
  legalForm: string
  vatNumber: string
  taxCode: string
  sdiCode: string
  pecEmail: string
  reaNumber: string
  shareCapital: string
  industry: string
  subIndustry: string
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  employeesCount: string
  annualRevenue: string
  primaryEmail: string
  primaryPhone: string
  website: string
  linkedinUrl: string
  facebookUrl: string
  instagramUrl: string
  legalAddress: string
  legalCity: string
  legalPostalCode: string
  legalProvince: string
  legalCountry: string
  leadSource: string
  leadStatus: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  customerSegment: 'vip' | 'gold' | 'silver' | 'bronze' | 'standard'
  paymentTermDays: string
  paymentMethod: 'bank_transfer' | 'credit_card' | 'paypal' | 'cash' | 'check' | 'other'
  creditLimit: string
  discountPercent: string
  description: string
  internalNotes: string
  active: boolean
}

