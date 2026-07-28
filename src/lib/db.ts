import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// In serverless environments (e.g. Netlify, Vercel, AWS Lambda), the workspace directory is read-only.
const isServerless = Boolean(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const baseDir = isServerless ? "/tmp" : process.cwd();

const dbDir = path.join(baseDir, "data");
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create dbDir at", dbDir, err);
  }
}

const uploadsDir = path.join(baseDir, "uploads");
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create uploadsDir at", uploadsDir, err);
  }
}

const dbPath = path.join(dbDir, "fileshare.db");
let db: InstanceType<typeof Database>;

try {
  db = new Database(dbPath);
  try {
    db.pragma("journal_mode = WAL");
  } catch {
    // WAL pragma may fail on ephemeral filesystems
  }
} catch (err) {
  console.warn("Falling back to in-memory SQLite database:", err);
  db = new Database(":memory:");
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    slug TEXT PRIMARY KEY,
    content TEXT DEFAULT '',
    isProtected INTEGER DEFAULT 0,
    passwordHash TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS files (
    fileId TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    originalName TEXT NOT NULL,
    storedName TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    downloadURL TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slug) REFERENCES pages(slug) ON DELETE CASCADE ON UPDATE CASCADE
  );
`);

export default db;

