// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import { ValidationError } from "@mini-erp/shared";

// Interfacce di ritorno per le utility di validazione
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
