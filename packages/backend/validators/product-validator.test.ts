import { describe, expect, test } from "bun:test";
import { getValidatedBody } from "../helpers/validated-context";
import { createHonoApp } from "../lib/hono-app";
import {
  limitProductImageUploadBody,
  validateUploadProductImages,
} from "./product-validator";
import type { UploadProductImagesInput } from "@mini-erp/shared";

const uploadPath = "/test/product-images";
const uploadUrl = `http://localhost${uploadPath}`;
const maxBodyBytes = 26 * 1024 * 1024;

function createTestApp() {
  const app = createHonoApp();
  const calls = { beforeParser: 0, handler: 0 };

  app.post(
    uploadPath,
    limitProductImageUploadBody,
    async (_c, next) => {
      calls.beforeParser += 1;
      await next();
    },
    validateUploadProductImages,
    (c) => {
      calls.handler += 1;
      const { files } = getValidatedBody<UploadProductImagesInput>(c);
      return c.json({ names: files.map((file) => file.name) });
    },
  );

  return { app, calls };
}

describe("product image upload validation", () => {
  test("rejects a declared body above 26 MiB before parsing", async () => {
    const { app, calls } = createTestApp();

    const request = new Request(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=test",
        "Content-Length": String(maxBodyBytes + 1),
      },
      body: "--test--\r\n",
    });

    const response = await app.request(request);

    expect(response.status).toBe(413);
    expect(calls).toEqual({ beforeParser: 0, handler: 0 });
  });

  test("rejects an actual body above 26 MiB without Content-Length", async () => {
    const { app, calls } = createTestApp();

    const request = new Request(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=test" },
      body: new Blob([new Uint8Array(maxBodyBytes + 1)]),
    });
    request.headers.delete("Content-Length");

    expect(request.headers.get("Content-Length")).toBeNull();

    const response = await app.request(request);

    expect(response.status).toBe(413);
    expect(calls).toEqual({ beforeParser: 0, handler: 0 });
  });

  test("preserves valid multipart files without Content-Length", async () => {
    const { app, calls } = createTestApp();
    const form = new FormData();

    form.append("files", new File(["a"], "front.png", { type: "image/png" }));
    form.append("files", new File(["b"], "back.webp", { type: "image/webp" }));

    const request = new Request(uploadUrl, {
      method: "POST",
      body: form,
    });
    request.headers.delete("Content-Length");

    expect(request.headers.get("Content-Length")).toBeNull();

    const response = await app.request(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ names: ["front.png", "back.webp"] });
    expect(calls).toEqual({ beforeParser: 1, handler: 1 });
  });
});