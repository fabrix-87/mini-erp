import { S3Client } from "bun";

/** Configuration required to access the MinIO object storage. */
export type MinioConfig = {
  endPoint: string;
  port: number;
  useSsl: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

/** Builds MinIO configuration from validated environment variables. */
export function getMinioConfig(): MinioConfig {
  const endPoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucketName = process.env.MINIO_BUCKET;
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;

  if (!endPoint || !accessKey || !secretKey || !bucketName || !publicBaseUrl) {
    throw new Error("MinIO configuration is incomplete");
  }

  const port = Number(process.env.MINIO_PORT ?? "9000");
  const useSsl = (process.env.MINIO_USE_SSL ?? "false").toLowerCase() === "true";

  return {
    endPoint,
    port,
    useSsl,
    accessKey,
    secretKey,
    bucketName,
    publicBaseUrl,
  };
}

/** Creates the Bun S3 client for authenticated MinIO object operations. */
export function createMinioS3Client(config: MinioConfig): S3Client {
  const protocol = config.useSsl ? "https" : "http";

  return new S3Client({
    endpoint: `${protocol}://${config.endPoint}:${config.port}`,
    bucket: config.bucketName,
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
    virtualHostedStyle: false,
  });
}