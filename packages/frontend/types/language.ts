import { ApiResponse, Language, PaginatedResponse } from "@mini-erp/shared";

export type { Language } from "@mini-erp/shared/types";

export type LanguageListApiResponse = PaginatedResponse<Language>;
export interface LanguageSingleApiResponse extends ApiResponse<Language> {}
