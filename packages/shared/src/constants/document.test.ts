// packages/shared/src/constants/document.test.ts
import { describe, expect, test } from "bun:test";
import {
  DOCUMENT_TYPE_CONFIG,
  DOCUMENT_TYPE_STATUS_TRANSITIONS,
  STATUSES_REQUIRING_NUMBER,
} from "./document";
import type { DocumentType } from "../types";
import { canDocumentTypeBeVoided, isInboundDocumentType } from "../helpers";

describe("DOCUMENT_TYPE_STATUS_TRANSITIONS", () => {
  test("VOIDED is reachable only from statuses that already have a number", () => {
    for (const [type, map] of Object.entries(DOCUMENT_TYPE_STATUS_TRANSITIONS)) {
      // Inbound documents: the equivalent of the number is the VAT registration.
      if (isInboundDocumentType(type as DocumentType)) continue;
      for (const [from, targets] of Object.entries(map)) {
        if (targets?.includes("VOIDED")) {
          expect(STATUSES_REQUIRING_NUMBER).toContain(from);
        }
      }
    }
  });
  test("document types requiring e-invoicing can never be voided", () => {
    for (const [type, config] of Object.entries(DOCUMENT_TYPE_CONFIG)) {
      if (config.requiresEInvoicing)
        expect(canDocumentTypeBeVoided(type as DocumentType)).toBe(false);
    }
  });
});
