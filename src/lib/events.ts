import { EventEmitter } from "events";

// Singleton EventEmitter instance across Next.js dev & prod reloads
const globalForEvents = global as unknown as { pageEvents?: EventEmitter };

export const pageEvents = globalForEvents.pageEvents || new EventEmitter();
pageEvents.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.pageEvents = pageEvents;
}
