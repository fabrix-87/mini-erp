// ============================================================================
// INTRASTAT CONSTANTS
// ============================================================================

/**
 * Intrastat flow types
 */
export const INTRASTAT_FLOWS = {
  ARRIVAL: "ARRIVAL", // Acquisti da UE
  DISPATCH: "DISPATCH", // Vendite verso UE
} as const;

/**
 * Intrastat flow labels
 */
export const INTRASTAT_FLOW_LABELS: Record<
  keyof typeof INTRASTAT_FLOWS,
  string
> = {
  ARRIVAL: "Arrivi (Acquisti)",
  DISPATCH: "Spedizioni (Vendite)",
};

// ============================================================================
// TRANSACTION CODES (Nature of Transaction)
// ============================================================================

/**
 * Most common Intrastat transaction codes
 * Format: 2 digits (first digit = category, second digit = subcategory)
 */
export const COMMON_TRANSACTION_CODES = {
  // 1x - Transactions involving actual or intended transfer of ownership
  OUTRIGHT_PURCHASE_SALE: "11",
  RETURN_REPLACEMENT: "12",
  FINANCIAL_LEASING: "13",
  OTHER_TRANSFER: "19",

  // 2x - Return and replacement of goods
  RETURN_GOODS: "21",
  REPLACEMENT_GOODS: "22",
  REPLACEMENT_UNDER_WARRANTY: "23",

  // 3x - Transactions without transfer of ownership
  PROCESSING: "30",
  REPAIRS_MAINTENANCE: "31",
  TEMPORARY_IMPORT_EXPORT: "32",

  // 4x - Operations after processing
  AFTER_PROCESSING: "41",
  AFTER_REPAIR: "42",

  // 5x - Specific transactions
  GOVERNMENT_TRANSACTIONS: "51",
  HUMANITARIAN_AID: "52",

  // 7x - Operations under joint defense projects
  DEFENSE_PROJECTS: "70",

  // 8x - Supply of construction materials
  CONSTRUCTION_MATERIALS: "80",

  // 9x - Other transactions
  HIRE_PURCHASE: "91",
  OTHER: "99",
} as const;

// ============================================================================
// MODE OF TRANSPORT CODES
// ============================================================================

/**
 * Intrastat transport mode codes
 */
export const TRANSPORT_MODES = {
  SEA: "1",
  RAIL: "2",
  ROAD: "3",
  AIR: "4",
  MAIL: "5",
  MULTIMODAL: "7",
  INLAND_WATERWAY: "8",
  SELF_PROPULSION: "9",
} as const;

export const TRANSPORT_MODE_LABELS: Record<
  keyof typeof TRANSPORT_MODES,
  string
> = {
  SEA: "Via mare",
  RAIL: "Per ferrovia",
  ROAD: "Su strada",
  AIR: "Via aerea",
  MAIL: "Per posta",
  MULTIMODAL: "Trasporto multimodale",
  INLAND_WATERWAY: "Per via navigabile interna",
  SELF_PROPULSION: "Autopropulsione",
};

// ============================================================================
// DELIVERY TERMS (Incoterms)
// ============================================================================

/**
 * Common Incoterms for Intrastat
 */
export const INCOTERMS = {
  // E - Departure
  EXW: "EXW", // Ex Works

  // F - Main carriage unpaid
  FCA: "FCA", // Free Carrier
  FAS: "FAS", // Free Alongside Ship
  FOB: "FOB", // Free On Board

  // C - Main carriage paid
  CFR: "CFR", // Cost and Freight
  CIF: "CIF", // Cost Insurance and Freight
  CPT: "CPT", // Carriage Paid To
  CIP: "CIP", // Carriage and Insurance Paid To

  // D - Arrival
  DAP: "DAP", // Delivered At Place
  DPU: "DPU", // Delivered at Place Unloaded
  DDP: "DDP", // Delivered Duty Paid
} as const;

// ============================================================================
// EU MEMBER STATES (for Intrastat reporting)
// ============================================================================

/**
 * EU member states country codes (ISO 3166-1 alpha-2)
 * Updated as of 2026 (post-Brexit)
 */
export const EU_MEMBER_STATES = [
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
] as const;

/**
 * Check if a country code is an EU member state
 */
export const isEUCountry = (countryCode: string): boolean => {
  return EU_MEMBER_STATES.includes(countryCode as any);
};

// ============================================================================
// REPORTING THRESHOLDS (2026 - Italy)
// ============================================================================

/**
 * Annual thresholds for Intrastat reporting (in EUR)
 * These are indicative and may change yearly
 */
export const INTRASTAT_THRESHOLDS = {
  DISPATCH: {
    STATISTICAL: 400000, // Above this: full statistical declaration required
    SIMPLIFIED: 200000, // Below this: simplified or no declaration
  },
  ARRIVAL: {
    STATISTICAL: 400000,
    SIMPLIFIED: 200000,
  },
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum commodity code length (NC8)
 */
export const COMMODITY_CODE_LENGTH = 8;

/**
 * Transaction code length
 */
export const TRANSACTION_CODE_LENGTH = 2;

/**
 * Country code length
 */
export const COUNTRY_CODE_LENGTH = 2;

/**
 * Maximum net mass in kg
 */
export const MAX_NET_MASS = 999999999.999;

/**
 * Maximum monetary value
 */
export const MAX_MONETARY_VALUE = 9999999999999.99;

/**
 * Maximum supplementary units
 */
export const MAX_SUPPLEMENTARY_UNITS = 999999999;

// ============================================================================
// REPORTING PERIODS
// ============================================================================

/**
 * Intrastat reporting frequency
 */
export const REPORTING_FREQUENCIES = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUAL: "ANNUAL",
} as const;

/**
 * Reporting deadlines (days after period end)
 */
export const REPORTING_DEADLINES = {
  MONTHLY: 25, // 25th day of following month
  QUARTERLY: 25,
  ANNUAL: 40,
} as const;

// ============================================================================
// COMMODITY CODE SECTIONS
// ============================================================================

/**
 * NC8 Commodity Code Sections (first 2 digits)
 */
export const COMMODITY_SECTIONS = {
  LIVE_ANIMALS: "01-05",
  VEGETABLE_PRODUCTS: "06-14",
  FATS_OILS: "15",
  FOOD_BEVERAGES: "16-24",
  MINERAL_PRODUCTS: "25-27",
  CHEMICALS: "28-38",
  PLASTICS_RUBBER: "39-40",
  HIDES_LEATHER: "41-43",
  WOOD_CORK: "44-46",
  PULP_PAPER: "47-49",
  TEXTILES: "50-63",
  FOOTWEAR_HEADGEAR: "64-67",
  STONE_GLASS: "68-70",
  PRECIOUS_METALS: "71",
  BASE_METALS: "72-83",
  MACHINERY_EQUIPMENT: "84-85",
  VEHICLES: "86-89",
  OPTICAL_INSTRUMENTS: "90-92",
  ARMS_AMMUNITION: "93",
  FURNITURE: "94",
  TOYS_GAMES: "95",
  MISCELLANEOUS: "96",
  ART_ANTIQUES: "97",
} as const;

// ============================================================================
// SORTING OPTIONS
// ============================================================================

export const INTRASTAT_TRANSACTION_SORT_OPTIONS = [
  "transactionDate",
  "partnerCountryCode",
  "commodityCode",
  "invoicedValue",
  "netMass",
  "createdAt",
] as const;

export const COMMODITY_CODE_SORT_OPTIONS = [
  "code",
  "descriptionIT",
  "descriptionEN",
] as const;

// ============================================================================
// REPORT FORMATS
// ============================================================================

/**
 * Intrastat report export formats
 */
export const REPORT_FORMATS = {
  CSV: "csv",
  XML: "xml",
  PDF: "pdf",
  EXCEL: "xlsx",
} as const;

/**
 * XML Schema versions for electronic submission
 */
export const XML_SCHEMA_VERSIONS = {
  INTRASTAT_2023: "1.0",
  INTRASTAT_2024: "1.1",
  INTRASTAT_2025: "1.2",
} as const;
