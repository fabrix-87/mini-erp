export type ViesCompanyData = {
  valid: boolean;
  vat_number?: string | null;
  country_code?: string | null;
  name?: string | null;
  address?: string | null;
};

export type ParsedViesAddress = {
  address: string;
  zipCode: string;
  city: string;
  countryCode: string;
};

export type ParsedViesCompany = {
  companyName: string;
  legalAddress: ParsedViesAddress;
};
