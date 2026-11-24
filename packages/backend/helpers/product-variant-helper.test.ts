import { describe, expect, test } from "bun:test";

import { buildVariantCombinationKey } from "./product-variant-helper";

describe("buildVariantCombinationKey", () => {
  test("returns the reserved key for a variant without attributes", () => {
    expect(buildVariantCombinationKey([])).toBe("default");
  });

  test("returns the same key regardless of attribute order", () => {
    expect(buildVariantCombinationKey(["red-id", "size-m-id"])).toBe(
      buildVariantCombinationKey(["size-m-id", "red-id"]),
    );
  });

  test("preserves the legacy SHA-1 encoding for a single attribute", () => {
    expect(buildVariantCombinationKey(["abc"])).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });

  test("preserves the legacy separator between sorted attribute IDs", () => {
    const legacyKey = "9abe6de24a871364bf412a1c301698b5ed30dbb7";

    expect(buildVariantCombinationKey(["b", "a"])).toBe(legacyKey);
  });

  test("does not mutate the input array", () => {
    const attributeIds = ["size-m-id", "red-id"];

    buildVariantCombinationKey(attributeIds);

    expect(attributeIds).toEqual(["size-m-id", "red-id"]);
  });
});
