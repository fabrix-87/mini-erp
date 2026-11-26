import { describe, expect, test } from "bun:test";

import { getValidatedBody } from "../helpers/validated-context";
import { createHonoApp } from "../lib/hono-app";
import { BadRequestError, ValidationError } from "../utils/app-error-utils";
import { validateMultipartBody } from "./validation-middleware";
import {
  MAX_PRODUCT_IMAGE_UPLOAD_FILE_BYTES,
  MAX_PRODUCT_IMAGE_UPLOAD_FILES,
  UploadProductImagesInput,
  uploadProductImagesSchema,
} from "@mini-erp/shared";

const route = "/test/product-images";

function createTestApp() {
  const app = createHonoApp();
  let received: UploadProductImagesInput | undefined;

  // Map only the expected application errors for this isolated middleware test.
  app.onError((error, c) => {
    if (error instanceof BadRequestError) return c.body(null, 400);
    if (error instanceof ValidationError) return c.body(null, 422);
    throw error;
  });

  app.post(
    route,
    validateMultipartBody(uploadProductImagesSchema, "Product image upload", ["files"]),
    (c) => {
      received = getValidatedBody<UploadProductImagesInput>(c);
      return c.body(null, 204);
    },
  );

  return {
    app,
    getReceived: () => received,
  };
}

function image(name = "front.png", type = "image/png", size = 1): File {
  return new File([new Uint8Array(size)], name, { type });
}

function formWithFiles(...files: File[]): FormData {
  const form = new FormData();

  for (const file of files) {
    form.append("files", file);
  }

  return form;
}

describe("validateMultipartBody", () => {
  test("normalizes one uploaded file to an array", async () => {
    const { app, getReceived } = createTestApp();

    const response = await app.request(route, {
      method: "POST",
      body: formWithFiles(image()),
    });

    expect(response.status).toBe(204);
    expect(getReceived()?.files).toHaveLength(1);
    expect(getReceived()?.files[0]).toBeInstanceOf(File);
    expect(getReceived()?.files[0]?.name).toBe("front.png");
    expect(getReceived()?.variantId).toBeUndefined();
  });

  test("preserves all files in their original order up to the allowed count", async () => {
    const { app, getReceived } = createTestApp();
    const files = Array.from({ length: MAX_PRODUCT_IMAGE_UPLOAD_FILES }, (_, index) =>
      image(`${index}.png`),
    );

    const response = await app.request(route, {
      method: "POST",
      body: formWithFiles(...files),
    });

    expect(response.status).toBe(204);
    expect(getReceived()?.files.map((file) => file.name)).toEqual(files.map((file) => file.name));
  });

  const invalidForms: Array<[string, () => FormData]> = [
    ["missing files", () => new FormData()],
    [
      "too many files",
      () =>
        formWithFiles(...Array.from({ length: MAX_PRODUCT_IMAGE_UPLOAD_FILES + 1 }, () => image())),
    ],
    ["empty file", () => formWithFiles(image("empty.png", "image/png", 0))],
    [
      "oversized file",
      () => formWithFiles(image("large.png", "image/png", MAX_PRODUCT_IMAGE_UPLOAD_FILE_BYTES + 1)),
    ],
    ["unsupported MIME type", () => formWithFiles(image("image.gif", "image/gif"))],
    [
      "text instead of a file",
      () => {
        const form = new FormData();
        form.append("files", "not a file");
        return form;
      },
    ],
    [
      "duplicate variantId",
      () => {
        const form = formWithFiles(image());
        const variantId = "cjld2cjxh0000qzrmn831i7rn";
        form.append("variantId", variantId);
        form.append("variantId", variantId);
        return form;
      },
    ],
    [
      "unknown field",
      () => {
        const form = formWithFiles(image());
        form.append("imageUrl", "https://example.com/image.png");
        return form;
      },
    ],
  ];

  test.each(invalidForms)("rejects %s without calling the handler", async (_, makeForm) => {
    const { app, getReceived } = createTestApp();

    const response = await app.request(route, {
      method: "POST",
      body: makeForm(),
    });

    expect(response.status).toBe(422);
    expect(getReceived()).toBeUndefined();
  });

  test.each([
    ["JSON", "application/json", "{}"],
    ["multipart without a boundary", "multipart/form-data", "invalid multipart body"],
  ])("rejects %s before schema validation", async (_, contentType, body) => {
    const { app, getReceived } = createTestApp();

    const response = await app.request(route, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });

    expect(response.status).toBe(400);
    expect(getReceived()).toBeUndefined();
  });
});
