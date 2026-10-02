"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  subscribePageEvents,
  isPageEventsClosed,
  type SSEMessage,
} from "@/lib/pageEventsClient";

export interface ConflictState {
  remoteContent: string;
  receivedAt: number;
}

export function usePageContent(
  slug: string,
  initialContent?: string,
  token?: string | null
) {
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [loading, setLoading] = useState(initialContent === undefined);
  const [prevSlug, setPrevSlug] = useState<string>(slug);
  const [collaboratorCount, setCollaboratorCount] = useState<number>(1);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  const [clientId] = useState(() =>
    typeof window !== "undefined"
      ? Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      : ""
  );

  const lastLocalEditAt = useRef<number>(0);
  const contentRef = useRef<string | null>(initialContent ?? null);

  // Sync state during render if slug changes between workspace navigations
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setContent(initialContent ?? null);
    setLoading(initialContent === undefined);
    setConflict(null);
    setCollaboratorCount(1);
  }

  // Reset refs when workspace slug or initialContent changes
  useEffect(() => {
    contentRef.current = initialContent ?? null;
    lastLocalEditAt.current = 0;
  }, [slug, initialContent]);

  const touchLocalEdit = useCallback(() => {
    lastLocalEditAt.current = Date.now();
  }, []);

  const syncLocalContent = useCallback((newText: string) => {
    contentRef.current = newText;
    lastLocalEditAt.current = Date.now();
  }, []);

  // Keep contentRef in sync for value comparison without triggering effects
  useEffect(() => {
    if (content !== null) {
      contentRef.current = content;
    }
  }, [content]);

  const resolveConflictTakeMine = useCallback(() => {
    lastLocalEditAt.current = 0;
    setConflict(null);
  }, []);

  const resolveConflictTakeRemote = useCallback(() => {
    if (conflict?.remoteContent !== undefined) {
      setContent(conflict.remoteContent);
      contentRef.current = conflict.remoteContent;
    }
    lastLocalEditAt.current = 0;
    setConflict(null);
  }, [conflict]);

  const resolveConflictMerge = useCallback((mergedText?: string) => {
    const finalMerged = mergedText ?? (conflict?.remoteContent ? `${contentRef.current || ""}\n\n<!-- ── Collaborator Remote Update ── -->\n${conflict.remoteContent}` : contentRef.current);
    if (finalMerged !== null && finalMerged !== undefined) {
      setContent(finalMerged);
      contentRef.current = finalMerged;
    }
    lastLocalEditAt.current = 0;
    setConflict(null);
  }, [conflict]);

  useEffect(() => {
    let active = true;

    async function fetchContent() {
      if (document.hidden) return;
      if (Date.now() - lastLocalEditAt.current < 2500) return;

      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`/api/pages/${slug}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const newText = data.content ?? "";
          if (active && newText !== contentRef.current && Date.now() - lastLocalEditAt.current >= 2500) {
            setContent(newText);
          }
        }
      } catch (err) {
        console.error("Failed to fetch page content:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (initialContent === undefined) {
      fetchContent();
    }

    // Instant Real-time Updates via unified Server-Sent Events (SSE) multiplexer
    const unsubscribeSSE = subscribePageEvents(
      slug,
      token,
      (data: SSEMessage) => {
        if (!active) return;

        // Handle Presence update
        if (data.type === "presence_updated" && typeof data.activeCount === "number") {
          setCollaboratorCount(data.activeCount);
        }

        // Handle Content update with soft-conflict detection
        if (data.type === "content_updated" && typeof data.content === "string") {
          // 1. If update was broadcasted by this client tab, ignore self-echo to prevent false conflict
          if (data.senderId && data.senderId === clientId) {
            contentRef.current = data.content;
            return;
          }

          // 2. If incoming text matches our current local content, ignore it (already in sync)
          if (data.content === contentRef.current) {
            return;
          }

          const isLocalDirty = Date.now() - lastLocalEditAt.current < 2500;
          if (isLocalDirty) {
            // Soft conflict: remote edit arrived from another collaborator while typing locally
            setConflict({
              remoteContent: data.content,
              receivedAt: Date.now(),
            });
          } else {
            // Clean remote update: apply directly
            setContent(data.content);
            contentRef.current = data.content;
            setConflict(null);
          }
        }
      },
      (status) => {
        if (active) setConnectionStatus(status);
      }
    );

    // Fallback polling only if EventSource is disconnected
    const fallbackInterval = setInterval(() => {
      if (isPageEventsClosed(slug, token)) {
        fetchContent();
      }
    }, 12000);

    return () => {
      active = false;
      unsubscribeSSE();
      clearInterval(fallbackInterval);
    };
  }, [slug, initialContent, token, clientId]);

  return {
    content,
    setContent,
    loading,
    touchLocalEdit,
    syncLocalContent,
    clientId,
    collaboratorCount,
    connectionStatus,
    conflict,
    resolveConflictTakeMine,
    resolveConflictTakeRemote,
    resolveConflictMerge,
  };
}
