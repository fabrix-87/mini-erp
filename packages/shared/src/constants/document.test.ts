// packages/shared/src/constants/document.test.ts
import { describe, expect, test } from "bun:test";
import {
  DOCUMENT_TYPE_STATUS_TRANSITIONS,
  STATUSES_REQUIRING_NUMBER,
} from "./document";
import type { DocumentType } from "../types";
import { isInboundDocumentType } from "../helpers";

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
});
