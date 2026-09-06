import { getRequestContext } from "@cloudflare/next-on-pages";

function getEnvDB() {
  try {
    const ctx = getRequestContext();
    if (ctx?.env?.DB) {
      return ctx.env.DB as any;
    }
  } catch (err) {
    // getRequestContext throws if called outside request context
  }
  throw new Error("Cloudflare D1 binding 'DB' is missing or not available in the current context.");
}

const db = {
  prepare: (sql: string) => {
    return {
      get: async (...params: any[]) => {
        const DB = getEnvDB();
        const res = await DB.prepare(sql).bind(...params).first();
        return res || undefined;
      },
      run: async (...params: any[]) => {
        const DB = getEnvDB();
        const res = await DB.prepare(sql).bind(...params).run();
        // D1 run() returns { success, meta, results } where changes is in meta.changes
        return { changes: res.meta?.changes ?? 0 };
      },
      all: async (...params: any[]) => {
        const DB = getEnvDB();
        const res = await DB.prepare(sql).bind(...params).all();
        return res.results || [];
      },
    };
  },
};

export default db;
