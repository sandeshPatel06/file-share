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

  const touchLocalEdit = useCallback(() => {
    lastLocalEditAt.current = Date.now();
  }, []);

  // Keep contentRef in sync for value comparison without triggering effects
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const resolveConflictTakeMine = useCallback(() => {
    touchLocalEdit();
    setConflict(null);
  }, [touchLocalEdit]);

  const resolveConflictTakeRemote = useCallback(() => {
    if (conflict?.remoteContent !== undefined) {
      setContent(conflict.remoteContent);
    }
    setConflict(null);
  }, [conflict]);

  const resolveConflictMerge = useCallback(() => {
    if (!conflict?.remoteContent) {
      setConflict(null);
      return;
    }
    const local = contentRef.current || "";
    const merged = `${local}\n\n<!-- ── Collaborator Remote Update ── -->\n${conflict.remoteContent}`;
    setContent(merged);
    touchLocalEdit();
    setConflict(null);
  }, [conflict, touchLocalEdit]);

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
          const isLocalDirty = Date.now() - lastLocalEditAt.current < 2500;
          const isDifferent = data.content !== contentRef.current;

          if (isDifferent) {
            if (isLocalDirty) {
              // Soft conflict: remote edit arrived while typing locally
              setConflict({
                remoteContent: data.content,
                receivedAt: Date.now(),
              });
            } else {
              // Clean update: apply directly
              setContent(data.content);
              setConflict(null);
            }
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
  }, [slug, initialContent, token]);

  return {
    content,
    setContent,
    loading,
    touchLocalEdit,
    collaboratorCount,
    connectionStatus,
    conflict,
    resolveConflictTakeMine,
    resolveConflictTakeRemote,
    resolveConflictMerge,
  };
}
