"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export function usePageContent(slug: string) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLocalEditAt = useRef<number>(0);
  const contentRef = useRef<string | null>(null);

  const touchLocalEdit = useCallback(() => {
    lastLocalEditAt.current = Date.now();
  }, []);

  // Keep contentRef in sync for value comparison without triggering effects
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    let active = true;

    async function fetchContent() {
      if (document.hidden) return;
      if (Date.now() - lastLocalEditAt.current < 2000) return;

      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const newText = data.content ?? "";
          // Only update state if value actually changed (prevents re-renders)
          if (active && newText !== contentRef.current && Date.now() - lastLocalEditAt.current >= 2000) {
            setContent(newText);
          }
        }
      } catch (err) {
        console.error("Failed to fetch page content:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    // Initial fetch
    fetchContent();

    // Instant Real-time Updates via Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/pages/${slug}/events`);

      eventSource.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "content_updated" && typeof data.content === "string") {
            // Only update if user hasn't typed locally recently & content actually changed
            if (Date.now() - lastLocalEditAt.current >= 1500 && data.content !== contentRef.current) {
              setContent(data.content);
            }
          }
        } catch {}
      };
    } catch {
      // EventSource fallback
    }

    // Fallback polling only if EventSource is not connected
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
  }, [slug]);

  return { content, setContent, loading, touchLocalEdit };
}
