import type { ContactQueryInput } from '@/types/contact-types';

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params: ContactQueryInput) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  byCompany: (companyId: string) => [...contactKeys.all, 'company', companyId] as const,
  primaryByCompany: (companyId: string) => [...contactKeys.all, 'primary', companyId] as const,
};
