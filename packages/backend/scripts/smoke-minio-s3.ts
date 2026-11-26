import { createMinioS3Client, getMinioConfig } from "../config/minio-config";

/** Verifies authenticated writes and deletes, and anonymous reads. */
async function smokeMinioS3(): Promise<void> {
  const config = getMinioConfig();
  const client = createMinioS3Client(config);
  const key = `_smoke/${crypto.randomUUID()}.txt`;
  const body = "mini-erp Bun S3 smoke test";
  const publicUrl = `${config.publicBaseUrl.replace(/\/+$/, "")}/${key}`;

  try {
    await client.write(key, body, { type: "text/plain" });

    const response = await fetch(publicUrl, { redirect: "error" });

    if (!response.ok || (await response.text()) !== body) {
      throw new Error("Anonymous object read failed");
    }
  } finally {
    await client.delete(key);
  }

  if (await client.exists(key)) {
    throw new Error("Temporary object still exists after deletion");
  }
}

try {
  await smokeMinioS3();
  console.info("MinIO smoke test passed");
} catch {
  console.error("MinIO smoke test failed. Check configuration, public read, and cleanup.");
  process.exitCode = 1;
}
