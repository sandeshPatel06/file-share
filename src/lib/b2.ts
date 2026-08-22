import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

function getB2Config() {
  const endpoint = process.env.B2_ENDPOINT || process.env.BACKBLAZE_B2_ENDPOINT || "";
  const keyId = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID || process.env.BACKBLAZE_B2_KEY_ID || "";
  const applicationKey = process.env.B2_APPLICATION_KEY || process.env.BACKBLAZE_B2_APPLICATION_KEY || "";
  const bucketName = process.env.B2_BUCKET_NAME || process.env.BACKBLAZE_B2_BUCKET_NAME || "";
  const region = process.env.B2_REGION || "us-west-004";

  if (!endpoint || !keyId || !applicationKey || !bucketName) {
    return null;
  }

  const formattedEndpoint = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;

  return {
    endpoint: formattedEndpoint,
    keyId,
    applicationKey,
    bucketName,
    region,
  };
}

export function hasB2Storage(): boolean {
  return Boolean(getB2Config());
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): { client: S3Client; bucketName: string } | null {
  const config = getB2Config();
  if (!config) return null;

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
    });
  }

  return { client: s3ClientInstance, bucketName: config.bucketName };
}

/**
 * Upload a file object to Backblaze B2
 */
export async function uploadToB2(
  storedName: string,
  body: Buffer | Readable | Uint8Array,
  mimetype: string
): Promise<boolean> {
  const b2 = getS3Client();
  if (!b2) return false;

  try {
    const command = new PutObjectCommand({
      Bucket: b2.bucketName,
      Key: storedName,
      Body: body,
      ContentType: mimetype,
    });

    await b2.client.send(command);
    return true;
  } catch (err) {
    console.error("Backblaze B2 Upload Error:", err);
    return false;
  }
}

/**
 * Stream / Download a file object from Backblaze B2 with optional HTTP Range header
 */
export async function getFromB2(
  storedName: string,
  range?: string | null
): Promise<{
  stream: ReadableStream | Readable;
  contentLength?: number;
  contentRange?: string;
  contentType?: string;
  statusCode: number;
} | null> {
  const b2 = getS3Client();
  if (!b2) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: b2.bucketName,
      Key: storedName,
      Range: range || undefined,
    });

    const response = await b2.client.send(command);
    if (!response.Body) return null;

    return {
      stream: response.Body as unknown as Readable,
      contentLength: response.ContentLength,
      contentRange: response.ContentRange,
      contentType: response.ContentType,
      statusCode: response.$metadata.httpStatusCode || 200,
    };
  } catch (err) {
    console.error("Backblaze B2 Download Error:", err);
    return null;
  }
}

/**
 * Delete a file object from Backblaze B2
 */
export async function deleteFromB2(storedName: string): Promise<boolean> {
  const b2 = getS3Client();
  if (!b2) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: b2.bucketName,
      Key: storedName,
    });

    await b2.client.send(command);
    return true;
  } catch (err) {
    console.error("Backblaze B2 Delete Error:", err);
    return false;
  }
}
