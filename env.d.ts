interface CloudflareEnv {
  UPLOADS_BUCKET: any;
}

interface Response {
  json(): Promise<any>;
}
