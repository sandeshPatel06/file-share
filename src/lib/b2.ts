import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.B2_ENDPOINT || "";
const region = process.env.B2_REGION || "us-east-005";

export const b2Client = new S3Client({
  endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
  region: region,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID || "",
    secretAccessKey: process.env.B2_APPLICATION_KEY || "",
  },
  forcePathStyle: true,
});

export const b2BucketName = process.env.B2_BUCKET_NAME || "";
