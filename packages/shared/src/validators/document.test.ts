import { describe, expect, it } from "bun:test";
import { createDocumentLineSchema } from "./document";

const VARIANT_ID = "cjld2cjxh0000qzrmn831i7rn";

const baseLine = { nameSystem: "Item", quantity: "1" } as const;

/** Returns the dotted paths of all validation issues, or an empty list on success. */
function issuePaths(input: unknown): string[] {
  const result = createDocumentLineSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("createDocumentLineSchema", () => {
  it("accepts a product line without price (price list applies)", () => {
    const result = createDocumentLineSchema.safeParse({
      ...baseLine,
      lineType: "PRODUCT",
      productVariantId: VARIANT_ID,
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.lineType === "PRODUCT") {
      expect(result.data.unitPrice).toBeUndefined();
    }
  });

  it("treats an empty unitPrice as absent", () => {
    const result = createDocumentLineSchema.safeParse({
      ...baseLine,
      lineType: "PRODUCT",
      productVariantId: VARIANT_ID,
      unitPrice: "",
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.lineType === "PRODUCT") {
      expect(result.data.unitPrice).toBeUndefined();
    }
  });

  it("keeps an explicit zero price as an override", () => {
    const result = createDocumentLineSchema.safeParse({
      ...baseLine,
      lineType: "PRODUCT",
      productVariantId: VARIANT_ID,
      unitPrice: "0",
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.lineType === "PRODUCT") {
      expect(result.data.unitPrice).toBe("0.000000");
    }
  });

  it("accepts a manual service line with a price", () => {
    expect(issuePaths({ ...baseLine, lineType: "SERVICE", unitPrice: "50" })).toEqual([]);
  });

  it("rejects a product line without variant", () => {
    expect(issuePaths({ ...baseLine, lineType: "PRODUCT", unitPrice: "10" })).toContain(
      "productVariantId",
    );
  });

  it("rejects a manual line without price", () => {
    expect(issuePaths({ ...baseLine, lineType: "SERVICE" })).toContain("unitPrice");
  });

  it("rejects a discount line referencing a variant", () => {
    expect(
      issuePaths({
        ...baseLine,
        lineType: "DISCOUNT",
        productVariantId: VARIANT_ID,
        unitPrice: "5",
      }),
    ).toContain("productVariantId");
  });

  it("rejects a descriptive line referencing a variant", () => {
    expect(
      issuePaths({ nameSystem: "Note", lineType: "TEXT", productVariantId: VARIANT_ID }),
    ).toContain("productVariantId");
  });

  it("accepts a plain descriptive line", () => {
    expect(issuePaths({ nameSystem: "Note", lineType: "TEXT" })).toEqual([]);
  });
});
