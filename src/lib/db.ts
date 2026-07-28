import path from "path";
import fs from "fs";

// In serverless environments (e.g. Netlify, Vercel, AWS Lambda), native C++ bindings for better-sqlite3 or read-only filesystems need safe fallback handling.
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
let db: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  db = new Database(dbPath);
  try {
    db.pragma("journal_mode = WAL");
  } catch {
    // WAL pragma may fail on ephemeral filesystems
  }
} catch (err) {
  console.warn("better-sqlite3 unavailable, using in-memory fallback store:", err);

  const memoryStore = {
    pages: new Map<string, any>(),
    files: new Map<string, any>()
  };

  db = {
    pragma: () => {},
    exec: () => {},
    prepare: (sql: string) => {
      const lower = sql.toLowerCase();
      return {
        run: (...params: any[]) => {
          if (lower.includes("insert into pages") || lower.includes("insert or ignore into pages")) {
            const [slug, content, isProtected, passwordHash] = params;
            if (!memoryStore.pages.has(slug)) {
              memoryStore.pages.set(slug, {
                slug,
                content: content || "",
                isProtected: isProtected || 0,
                passwordHash: passwordHash || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          } else if (lower.includes("update pages")) {
            if (lower.includes("content =")) {
              const [content, slug] = params;
              const page = memoryStore.pages.get(slug) || { slug };
              page.content = content;
              page.updatedAt = new Date().toISOString();
              memoryStore.pages.set(slug, page);
            }
          } else if (lower.includes("insert into files")) {
            const [fileId, slug, originalName, storedName, mimetype, size, downloadURL] = params;
            memoryStore.files.set(fileId, {
              fileId,
              slug,
              originalName,
              storedName,
              mimetype,
              size,
              downloadURL,
              uploadedAt: new Date().toISOString()
            });
          } else if (lower.includes("delete from files")) {
            const [fileId] = params;
            memoryStore.files.delete(fileId);
          }
          return { changes: 1 };
        },
        get: (...params: any[]) => {
          if (lower.includes("from pages")) {
            const [slug] = params;
            return memoryStore.pages.get(slug) || undefined;
          } else if (lower.includes("from files")) {
            const [fileId] = params;
            return memoryStore.files.get(fileId) || undefined;
          }
          return undefined;
        },
        all: (...params: any[]) => {
          if (lower.includes("from files")) {
            const [slug] = params;
            return Array.from(memoryStore.files.values()).filter((f: any) => f.slug === slug);
          }
          return [];
        }
      };
    }
  };
}

// Initialize tables if real db is active
if (db && typeof db.exec === "function") {
  try {
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
  } catch (err) {
    console.error("Table creation failed:", err);
  }
}

export default db;
