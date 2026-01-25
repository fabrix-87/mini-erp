import type { ContactQueryInput } from '@/types/contact';

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params: ContactQueryInput) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: number) => [...contactKeys.details(), id] as const,
  byCompany: (companyId: number) => [...contactKeys.all, 'company', companyId] as const,
  primaryByCompany: (companyId: number) => [...contactKeys.all, 'primary', companyId] as const,
};
