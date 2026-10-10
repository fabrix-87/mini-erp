import { z } from "zod";
import {
  sdiTransmissionFormatSchema,
  tenantStatusSchema,
  tenantPlanSchema,
  taxRegimeSchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type SdiTransmissionFormat = z.infer<typeof sdiTransmissionFormatSchema>;
export type TenantStatus = z.infer<typeof tenantStatusSchema>;
export type TenantPlan = z.infer<typeof tenantPlanSchema>;
export type TaxRegime = z.infer<typeof taxRegimeSchema>;

export const TENANT_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    TRIAL: "TRIAL",
    CANCELLED: "CANCELLED",
} as const;

export const TENANT_PLAN = {
    FREE: "FREE",
    STARTER: "STARTER",
    PROFESSIONAL: "PROFESSIONAL",
    ENTERPRISE: "ENTERPRISE",
} as const;

/**
 * Italian tax regime codes (Regimi Fiscali SDI).
 * Codes follow AdE (Agenzia delle Entrate) specification RF01–RF19.
 *
 * @see {@link https://www.agenziaentrate.gov.it} AdE Fatturazione Elettronica
 */
export const TAX_REGIME = {
    RF01: "RF01", // Ordinario
    RF02: "RF02", // Contribuenti minimi (ex art. 27, DL 98/2011)
    RF04: "RF04", // Agricoltura e attività connesse
    RF05: "RF05", // Vendita sali e tabacchi
    RF06: "RF06", // Commercio fiammiferi
    RF07: "RF07", // Editoria
    RF08: "RF08", // Gestione servizi telefonia pubblica
    RF09: "RF09", // Rivendita documenti di trasporto pubblico
    RF10: "RF10", // Intrattenimenti, giochi e altre attività
    RF11: "RF11", // Agenzie viaggi e turismo
    RF12: "RF12", // Agriturismo
    RF13: "RF13", // Vendite a domicilio
    RF14: "RF14", // Rivenditore beni usati e oggetti d'arte
    RF15: "RF15", // Agenzie di vendite all'asta
    RF16: "RF16", // IVA per cassa (art. 32-bis DL 83/2012)
    RF17: "RF17", // IVA per cassa (art. 6 c.5 DPR 633/1972)
    RF18: "RF18", // Altro
    RF19: "RF19", // Regime forfettario (L. 190/2014)
} as const;

export const SDI_FORMAT = {
    FPR12: "FPR12", // Fattura ordinaria
    FPA12: "FPA12", // Fattura PA (Pubblica Amministrazione)
} as const;

export const TENANT_SORT_OPTIONS = ["id", "tenantCode", "createdAt"] as const;

// ============================================================================
// LABEL MAPS
// ============================================================================

/** Human-readable labels for TenantStatus values */
export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: "Attivo",
  SUSPENDED: "Sospeso",
  TRIAL: "Periodo di prova",
  CANCELLED: "Cancellato",
};

/** Human-readable labels for TenantPlan values */
export const TENANT_PLAN_LABELS: Record<TenantPlan, string> = {
  FREE: "Gratuito",
  STARTER: "Starter",
  PROFESSIONAL: "Professionale",
  ENTERPRISE: "Enterprise",
};

/** Human-readable labels for TaxRegime codes (Italian AdE specification) */
export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  RF01: "Regime ordinario", // Ordinario
  RF02: "Contribuenti minimi (ex art. 27, DL 98/2011)",
  RF04: "Agricoltura e attività connesse e pesca",
  RF05: "Vendita sali e tabacchi",
  RF06: "Commercio dei fiammiferi",
  RF07: "Editoria",
  RF08: "Gestione di servizi di telefonia pubblica",
  RF09: "Rivendita di documenti di trasporto pubblico",
  RF10: "Intrattenimenti, giochi e altre attività",
  RF11: "Agenzie di viaggi e turismo",
  RF12: "Agriturismo",
  RF13: "Vendite a domicilio",
  RF14: "Rivenditore di beni usati e oggetti d'arte",
  RF15: "Agenzie di vendite all'asta",
  RF16: "IVA per cassa (art. 32-bis, DL 83/2012)",
  RF17: "IVA per cassa (art. 6 c.5, DPR 633/1972)",
  RF18: "Altro",
  RF19: "Regime forfettario (L. 190/2014)",
};

/** SDI transmission format labels */
export const SDI_FORMAT_LABELS: Record<SdiTransmissionFormat, string> = {
  FPR12: "Fattura tra privati (FPR12)",
  FPA12: "Fattura verso PA (FPA12)",
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default tenant status at creation */
export const DEFAULT_TENANT_STATUS: TenantStatus = TENANT_STATUS.ACTIVE;

/** Default tenant plan at creation */
export const DEFAULT_TENANT_PLAN: TenantPlan = TENANT_PLAN.FREE;

/** Default Italian tax regime */
export const DEFAULT_TAX_REGIME: TaxRegime = TAX_REGIME.RF01;

/** Default currency ISO 4217 code */
export const DEFAULT_TENANT_CURRENCY = "EUR";

/** Maximum length of tenant code slug */
export const TENANT_CODE_MAX_LENGTH = 20;
