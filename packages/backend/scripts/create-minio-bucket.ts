import { createMinioClient, getMinioConfig } from "../config/minio-config";

const PUBLIC_READ_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${getMinioConfig().bucketName}/*`],
    },
  ],
};

/**
 * Creates the configured MinIO bucket when it does not exist and enables
 * public read access for stored product images.
 */
async function createMinioBucket(): Promise<void> {
  const config = getMinioConfig();
  const minio = createMinioClient(config);

  const exists = await minio.bucketExists(config.bucketName);

  if (!exists) {
    await minio.makeBucket(config.bucketName, "eu-central-1");
    console.info(`Created MinIO bucket: ${config.bucketName}`);
  } else {
    console.info(`MinIO bucket already exists: ${config.bucketName}`);
  }

  await minio.setBucketPolicy(config.bucketName, JSON.stringify(PUBLIC_READ_POLICY));

  console.info(`Public read policy applied to: ${config.bucketName}`);
}

createMinioBucket()
  .then(() => {
    console.info("MinIO bootstrap completed");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("MinIO bootstrap failed", error);
    process.exit(1);
  });
