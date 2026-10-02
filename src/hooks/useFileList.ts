"use client";
import { useEffect, useState, useRef } from "react";
import {
  subscribePageEvents,
  isPageEventsClosed,
  type SSEMessage,
} from "@/lib/pageEventsClient";

export interface FileItem {
  fileId:       string;
  originalName: string;
  downloadURL:  string;
  mimetype:     string;
  size:         number;
  uploadedAt:   { seconds: number } | null;
}

export function useFileList(slug: string, token?: string | null) {
  const [files, setFiles]     = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const filesJsonRef          = useRef<string>("");

  useEffect(() => {
    let active = true;

    async function fetchFiles() {
      if (document.hidden) return;
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`/api/pages/${slug}/files`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            const newJson = JSON.stringify(data);
            // Only update state if file list structure or items actually changed
            if (newJson !== filesJsonRef.current) {
              filesJsonRef.current = newJson;
              setFiles(data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch file list:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    // Initial fetch
    fetchFiles();

    // Instant Real-time Updates via unified Server-Sent Events (SSE) multiplexer
    const unsubscribeSSE = subscribePageEvents(
      slug,
      token,
      (data: SSEMessage) => {
        if (!active) return;
        if (data.type === "files_updated") {
          fetchFiles();
        }
      }
    );

    // Fallback polling only if EventSource is not connected
    const fallbackInterval = setInterval(() => {
      if (isPageEventsClosed(slug, token)) {
        fetchFiles();
      }
    }, 12000);

    return () => {
      active = false;
      unsubscribeSSE();
      clearInterval(fallbackInterval);
    };
  }, [slug, token]);

  return { files, loading };
}
