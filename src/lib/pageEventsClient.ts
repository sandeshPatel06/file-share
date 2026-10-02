"use client";

export type SSEMessage = {
  type: string;
  [key: string]: unknown;
};

export type ConnectionStatus = "connected" | "connecting" | "disconnected";
export type PageEventListener = (data: SSEMessage) => void;
export type StatusListener = (status: ConnectionStatus) => void;

interface PageConnection {
  eventSource: EventSource;
  listeners: Set<PageEventListener>;
  statusListeners: Set<StatusListener>;
  status: ConnectionStatus;
  refCount: number;
}

const connections = new Map<string, PageConnection>();

/**
 * Constructs the EventSource URL for a given slug and optional token.
 * Passes token via query parameter exclusively for EventSource due to browser API limitations.
 */
export function getEventSourceUrl(slug: string, token?: string | null): string {
  return token
    ? `/api/pages/${slug}/events?token=${encodeURIComponent(token)}`
    : `/api/pages/${slug}/events`;
}

/**
 * Subscribes to Server-Sent Events for a workspace slug and optional auth token.
 * Unifies multiple hook subscriptions (e.g. usePageContent and useFileList) onto a
 * single underlying EventSource connection per browser tab.
 *
 * Benefits:
 * 1. Single network stream per tab instead of duplicate connections.
 * 2. Fixes double presence count (server counts 1 listener per client tab).
 * 3. Handles auth token via ?token= query parameter without logging JWT.
 * 4. Automatic connection teardown when all subscribers unmount.
 */
export function subscribePageEvents(
  slug: string,
  token: string | null | undefined,
  onMessage: PageEventListener,
  onStatusChange?: StatusListener
): () => void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return () => {};
  }

  const key = `${slug}:${token ?? ""}`;
  let conn = connections.get(key);

  if (!conn) {
    const sseUrl = getEventSourceUrl(slug, token);
    const es = new EventSource(sseUrl);

    conn = {
      eventSource: es,
      listeners: new Set(),
      statusListeners: new Set(),
      status: "connecting",
      refCount: 0,
    };

    es.onopen = () => {
      const c = connections.get(key);
      if (c) {
        c.status = "connected";
        c.statusListeners.forEach((fn) => fn("connected"));
      }
    };

    es.onerror = () => {
      const c = connections.get(key);
      if (c) {
        c.status = "disconnected";
        c.statusListeners.forEach((fn) => fn("disconnected"));
      }
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const c = connections.get(key);
        if (c) {
          c.listeners.forEach((fn) => {
            try {
              fn(data);
            } catch (err) {
              console.error("Error handling SSE event:", err);
            }
          });
        }
      } catch {
        // Heartbeats and non-JSON SSE comments ignored
      }
    };

    connections.set(key, conn);
  }

  conn.refCount++;
  conn.listeners.add(onMessage);

  if (onStatusChange) {
    conn.statusListeners.add(onStatusChange);
    // Emit current status immediately upon subscription
    onStatusChange(conn.status);
  }

  return () => {
    const current = connections.get(key);
    if (!current) return;

    current.listeners.delete(onMessage);
    if (onStatusChange) {
      current.statusListeners.delete(onStatusChange);
    }
    current.refCount--;

    if (current.refCount <= 0) {
      try {
        current.eventSource.close();
      } catch {}
      connections.delete(key);
    }
  };
}

/**
 * Returns true if the EventSource for the given slug/token is absent or in CLOSED readyState.
 * Used by fallback polling intervals.
 */
export function isPageEventsClosed(slug: string, token?: string | null): boolean {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return true;
  }
  const key = `${slug}:${token ?? ""}`;
  const conn = connections.get(key);
  if (!conn) return true;
  return conn.eventSource.readyState === EventSource.CLOSED;
}
