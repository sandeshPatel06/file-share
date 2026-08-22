import path from "path";
import fs from "fs";

const isServerless = Boolean(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const baseDir = isServerless ? "/tmp" : process.cwd();

const uploadsDir = path.join(baseDir, "uploads");
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create uploadsDir at", uploadsDir, err);
  }
}

interface PgPoolClient {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;
  on?: (event: string, listener: (err: Error) => void) => void;
}

interface SqlitePrepared {
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => { changes: number };
  all: (...params: unknown[]) => unknown[];
}

interface SqliteDbClient {
  pragma: (sql: string) => void;
  exec: (sql: string) => void;
  prepare: (sql: string) => SqlitePrepared;
}

// Global DB client abstraction supporting PostgreSQL (via DATABASE_URL), SQLite, or Memory Store fallback
let pgPool: PgPoolClient | null = null;
let sqliteDb: SqliteDbClient | null = null;

const memoryStore = {
  pages: new Map<string, Record<string, unknown>>(),
  files: new Map<string, Record<string, unknown>>(),
};

const hasPg = Boolean(process.env.DATABASE_URL);

if (hasPg) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    let connectionString = process.env.DATABASE_URL || "";
    
    // Auto-detect Render container runtime environment vs local development machine
    const isRenderRuntime = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.PORT);

    if (connectionString.includes("dpg-da3dpqtg1s2s73ddgnd0-a")) {
      if (isRenderRuntime && !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1")) {
        // Internal Render Network: connect to internal host dpg-da3dpqtg1s2s73ddgnd0-a
        connectionString = connectionString.replace(
          /@dpg-da3dpqtg1s2s73ddgnd0-a[a-z0-9.-]*/,
          "@dpg-da3dpqtg1s2s73ddgnd0-a"
        );
      } else {
        // External machine: connect to external FQDN dpg-da3dpqtg1s2s73ddgnd0-a-a.oregon-postgres.render.com
        connectionString = connectionString.replace(
          /@dpg-da3dpqtg1s2s73ddgnd0-a[a-z0-9.-]*/,
          "@dpg-da3dpqtg1s2s73ddgnd0-a-a.oregon-postgres.render.com"
        );
      }
    }

    const isLocal = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1");
    pgPool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pgPool?.on?.("error", (err: Error) => {
      console.warn("PostgreSQL pool background error caught:", err.message);
    });

    // Provision PostgreSQL tables and migrate any existing unquoted columns
    pgPool
      ?.query(`
        CREATE TABLE IF NOT EXISTS pages (
          slug VARCHAR(255) PRIMARY KEY,
          content TEXT DEFAULT '',
          "isProtected" INTEGER DEFAULT 0,
          "passwordHash" TEXT DEFAULT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'isprotected') THEN
            ALTER TABLE pages RENAME COLUMN isprotected TO "isProtected";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'passwordhash') THEN
            ALTER TABLE pages RENAME COLUMN passwordhash TO "passwordHash";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'createdat') THEN
            ALTER TABLE pages RENAME COLUMN createdat TO "createdAt";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'updatedat') THEN
            ALTER TABLE pages RENAME COLUMN updatedat TO "updatedAt";
          END IF;
        END $$;

        ALTER TABLE pages ADD COLUMN IF NOT EXISTS "isProtected" INTEGER DEFAULT 0;
        ALTER TABLE pages ADD COLUMN IF NOT EXISTS "passwordHash" TEXT DEFAULT NULL;
        ALTER TABLE pages ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE pages ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        CREATE TABLE IF NOT EXISTS files (
          "fileId" VARCHAR(255) PRIMARY KEY,
          slug VARCHAR(255) NOT NULL,
          "originalName" TEXT NOT NULL,
          "storedName" TEXT NOT NULL,
          mimetype TEXT NOT NULL,
          size BIGINT NOT NULL,
          "downloadURL" TEXT NOT NULL,
          "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (slug) REFERENCES pages(slug) ON DELETE CASCADE ON UPDATE CASCADE
        );

        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'fileid') THEN
            ALTER TABLE files RENAME COLUMN fileid TO "fileId";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'originalname') THEN
            ALTER TABLE files RENAME COLUMN originalname TO "originalName";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'storedname') THEN
            ALTER TABLE files RENAME COLUMN storedname TO "storedName";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'downloadurl') THEN
            ALTER TABLE files RENAME COLUMN downloadurl TO "downloadURL";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'uploadedat') THEN
            ALTER TABLE files RENAME COLUMN uploadedat TO "uploadedAt";
          END IF;
        END $$;

        ALTER TABLE files ADD COLUMN IF NOT EXISTS "originalName" TEXT;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS "storedName" TEXT;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS "downloadURL" TEXT;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `)
      .catch((err: unknown) => console.error("PostgreSQL table provisioning error:", err));
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool:", err);
  }
} else {
  const dbDir = path.join(baseDir, "data");
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create dbDir at", dbDir, err);
    }
  }

  const dbPath = path.join(dbDir, "fileshare.db");
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    sqliteDb = new Database(dbPath);
    try {
      sqliteDb?.pragma("journal_mode = WAL");
    } catch {
      // WAL pragma may fail on ephemeral filesystems
    }

    sqliteDb?.exec(`
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
    console.warn("better-sqlite3 unavailable, using in-memory fallback store:", err);
  }
}

function convertSqlForPg(sql: string): string {
  let paramCount = 0;
  let pgSql = sql.replace(/\?/g, () => {
    paramCount++;
    return `$${paramCount}`;
  });

  if (pgSql.toLowerCase().includes("insert or ignore into pages")) {
    pgSql = pgSql.replace(/insert or ignore into pages/i, "INSERT INTO pages");
    if (!pgSql.toLowerCase().includes("on conflict")) {
      pgSql += " ON CONFLICT (slug) DO NOTHING";
    }
  }

  // Quote camelCase identifiers for PostgreSQL case sensitivity
  pgSql = pgSql
    .replace(/(?<!")\bisProtected\b(?!")/gi, '"isProtected"')
    .replace(/(?<!")\bpasswordHash\b(?!")/gi, '"passwordHash"')
    .replace(/(?<!")\bcreatedAt\b(?!")/gi, '"createdAt"')
    .replace(/(?<!")\bupdatedAt\b(?!")/gi, '"updatedAt"')
    .replace(/(?<!")\bfileId\b(?!")/gi, '"fileId"')
    .replace(/(?<!")\boriginalName\b(?!")/gi, '"originalName"')
    .replace(/(?<!")\bstoredName\b(?!")/gi, '"storedName"')
    .replace(/(?<!")\bdownloadURL\b(?!")/gi, '"downloadURL"')
    .replace(/(?<!")\buploadedAt\b(?!")/gi, '"uploadedAt"');

  return pgSql;
}

function normalizeRow(row: Record<string, unknown> | null | undefined): Record<string, unknown> | null | undefined {
  if (!row) return row;
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    const val = row[key];
    const lower = key.toLowerCase();
    if (lower === "isprotected") normalized.isProtected = Number(val);
    else if (lower === "passwordhash") normalized.passwordHash = val;
    else if (lower === "originalname") normalized.originalName = val;
    else if (lower === "storedname") normalized.storedName = val;
    else if (lower === "downloadurl") normalized.downloadURL = val;
    else if (lower === "fileid") normalized.fileId = val;
    else if (lower === "createdat") normalized.createdAt = val;
    else if (lower === "updatedat") normalized.updatedAt = val;
    else if (lower === "size") normalized.size = Number(val);
    else normalized[key] = val;
  }
  return normalized;
}

function memoryRun(sql: string, params: unknown[]) {
  const lower = sql.toLowerCase();
  if (lower.includes("insert into pages") || lower.includes("insert or ignore into pages")) {
    const [slug, content, isProtected, passwordHash] = params as [string, string?, number?, string?];
    if (!memoryStore.pages.has(slug)) {
      memoryStore.pages.set(slug, {
        slug,
        content: content || "",
        isProtected: isProtected || 0,
        passwordHash: passwordHash || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } else if (lower.includes("update pages")) {
    if (lower.includes("content =")) {
      const [content, slug] = params as [string, string];
      const page = memoryStore.pages.get(slug) || { slug };
      page.content = content;
      page.updatedAt = new Date().toISOString();
      memoryStore.pages.set(slug, page);
    } else if (lower.includes("isprotected =") && lower.includes("passwordhash =")) {
      if (params.length === 3) {
        const [isProtected, passwordHash, slug] = params as [number, string, string];
        const page = memoryStore.pages.get(slug) || { slug };
        page.isProtected = isProtected;
        page.passwordHash = passwordHash;
        memoryStore.pages.set(slug, page);
      } else {
        const [slug] = params as [string];
        const page = memoryStore.pages.get(slug) || { slug };
        page.isProtected = 0;
        page.passwordHash = null;
        memoryStore.pages.set(slug, page);
      }
    } else if (lower.includes("slug =")) {
      const [newSlug, oldSlug] = params as [string, string];
      const page = memoryStore.pages.get(oldSlug);
      if (page) {
        memoryStore.pages.delete(oldSlug);
        page.slug = newSlug;
        memoryStore.pages.set(newSlug, page);
      }
    }
  } else if (lower.includes("insert into files")) {
    const [fileId, slug, originalName, storedName, mimetype, size, downloadURL] = params as [string, string, string, string, string, number, string];
    memoryStore.files.set(fileId, {
      fileId,
      slug,
      originalName,
      storedName,
      mimetype,
      size,
      downloadURL,
      uploadedAt: new Date().toISOString(),
    });
  } else if (lower.includes("delete from files")) {
    const [fileId] = params as [string];
    memoryStore.files.delete(fileId);
  }
  return { changes: 1 };
}

function memoryGet(sql: string, params: unknown[]) {
  const lower = sql.toLowerCase();
  if (lower.includes("from pages")) {
    const [slug] = params as [string];
    return memoryStore.pages.get(slug) || undefined;
  } else if (lower.includes("from files")) {
    const [fileId] = params as [string];
    if (fileId) {
      return memoryStore.files.get(fileId) || undefined;
    }
  }
  return undefined;
}

function memoryAll(sql: string, params: unknown[]) {
  const lower = sql.toLowerCase();
  if (lower.includes("from files")) {
    const [slug] = params as [string];
    return Array.from(memoryStore.files.values()).filter((f) => f.slug === slug);
  }
  return [];
}

async function queryPgWithRetry(sql: string, params: unknown[]) {
  if (!pgPool) throw new Error("pgPool unavailable");
  const pgSql = convertSqlForPg(sql);
  const flattenedParams = params.flat();

  try {
    return await pgPool.query(pgSql, flattenedParams);
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes("terminated unexpectedly") || msg.includes("closed") || msg.includes("ECONNRESET") || msg.includes("socket")) {
      await new Promise((r) => setTimeout(r, 200));
      return await pgPool.query(pgSql, flattenedParams);
    }
    throw err;
  }
}

const db = {
  prepare: (sql: string) => {
    return {
      get: async (...params: unknown[]) => {
        if (pgPool) {
          const res = await queryPgWithRetry(sql, params);
          return res.rows.length > 0 ? normalizeRow(res.rows[0]) : undefined;
        }
        if (sqliteDb) {
          return sqliteDb.prepare(sql).get(...params);
        }
        return memoryGet(sql, params);
      },
      run: async (...params: unknown[]) => {
        if (pgPool) {
          const res = await queryPgWithRetry(sql, params);
          return { changes: res.rowCount ?? 0 };
        }
        if (sqliteDb) {
          return sqliteDb.prepare(sql).run(...params);
        }
        return memoryRun(sql, params);
      },
      all: async (...params: unknown[]) => {
        if (pgPool) {
          const res = await queryPgWithRetry(sql, params);
          return res.rows.map(normalizeRow);
        }
        if (sqliteDb) {
          return sqliteDb.prepare(sql).all(...params);
        }
        return memoryAll(sql, params);
      },
    };
  },
};

export default db;
