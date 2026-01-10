import { Language } from "./language";

export interface Country {
    code: string;
    name: string;
    isEu: boolean;
    languages?: Language
}

export interface CountryQueryParams {
    page: number;
    limit: number;
    search?: string;
    isEU?: boolean;
}