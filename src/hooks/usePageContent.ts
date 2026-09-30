"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export interface ConflictState {
  remoteContent: string;
  receivedAt: number;
}

export function usePageContent(slug: string, initialContent?: string) {
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
        const res = await fetch(`/api/pages/${slug}`);
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

    // Instant Real-time Updates via Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/pages/${slug}/events`);

      eventSource.onopen = () => {
        if (active) setConnectionStatus("connected");
      };

      eventSource.onerror = () => {
        if (active) setConnectionStatus("disconnected");
      };

      eventSource.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);

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
        } catch {}
      };
    } catch {
      // EventSource fallback
    }

    // Fallback polling only if EventSource is disconnected
    const fallbackInterval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        fetchContent();
      }
    }, 12000);

    return () => {
      active = false;
      if (eventSource) eventSource.close();
      clearInterval(fallbackInterval);
    };
  }, [slug, initialContent]);

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
