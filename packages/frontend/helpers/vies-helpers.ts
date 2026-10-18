// packages/frontend/helpers/vies-helpers.ts

import { ParsedViesCompany, ViesCompanyData } from "@/types/vies-types";

/**
 * Parses a VIES free-form address into structured company address fields.
 * @param viesData - Raw data returned by the VIES lookup service.
 * @returns Structured company data, or null when the response is not usable.
 */
export function parseViesCompanyData(viesData: ViesCompanyData): ParsedViesCompany | null {
  if (!viesData.valid || !viesData.name || !viesData.address) {
    return null;
  }

  const countryCode = viesData.country_code?.trim().toUpperCase() ?? "";
  const addressLines = viesData.address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (addressLines.length === 0) {
    return null;
  }

  const streetAddress = addressLines.slice(0, -1).join(", ");
  const lastLine = addressLines.at(-1) ?? "";

  const { zipCode, city } = parseZipCodeAndCity(lastLine);

  return {
    companyName: viesData.name.trim(),
    legalAddress: {
      address: streetAddress || lastLine,
      zipCode,
      city,
      countryCode,
    },
  };
}

/**
 * Extracts a postal code and city from the final VIES address line.
 * @param line - Final address line, usually containing postal code and city.
 * @returns Parsed postal code and city, with empty strings as fallbacks.
 */
function parseZipCodeAndCity(line: string): {
  zipCode: string;
  city: string;
} {
  const normalizedLine = line.replace(/\s+/g, " ").trim();

  const patterns: Array<{
    regex: RegExp;
    zipCodeGroup: number;
    normalize?: (zipCode: string) => string;
  }> = [
    // Netherlands and similar formats:
    // "2288GK RIJSWIJK ZH"
    {
      regex: /^(\d{4}[A-Z]{2})\s+(.+)$/i,
      zipCodeGroup: 1,
    },

    // Luxembourg and prefixed formats:
    // "L-1855 LUXEMBOURG"
    {
      regex: /^([A-Z]{1,2}-)?(\d{3,10})\s+(.+)$/i,
      zipCodeGroup: 2,
      normalize: normalizePostalCode,
    },

    // Generic space-separated formats:
    // "53225 Bonn"
    // "10115 Berlin"
    {
      regex: /^(\d{3,10})\s+(.+)$/i,
      zipCodeGroup: 1,
    },
  ];

  for (const pattern of patterns) {
    const match = normalizedLine.match(pattern.regex);

    if (!match) {
      continue;
    }

    const zipCode = match[pattern.zipCodeGroup] ?? "";
    const city = match[pattern.zipCodeGroup + 1] ?? "";

    if (!city) {
      continue;
    }

    return {
      zipCode: pattern.normalize ? pattern.normalize(zipCode) : zipCode,
      city: city.trim(),
    };
  }

  return { zipCode: "", city: normalizedLine };
}

/**
 * Removes an optional country prefix from a postal code.
 * @param postalCode - Raw postal code token, for example "L-1855".
 * @returns Normalized postal code, for example "1855".
 */
function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/^[A-Z]{1,2}-/i, "").trim();
}
