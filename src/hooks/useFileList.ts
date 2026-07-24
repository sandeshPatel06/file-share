"use client";
import { useEffect, useState, useRef } from "react";

export interface FileItem {
  fileId:       string;
  originalName: string;
  downloadURL:  string;
  mimetype:     string;
  size:         number;
  uploadedAt:   { seconds: number } | null;
}

export function useFileList(slug: string) {
  const [files, setFiles]     = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const filesJsonRef          = useRef<string>("");

  useEffect(() => {
    let active = true;

    async function fetchFiles() {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/pages/${slug}/files`);
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

    // Instant Real-time Updates via Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/pages/${slug}/events`);

      eventSource.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "files_updated") {
            fetchFiles();
          }
        } catch {}
      };
    } catch {
      // EventSource fallback
    }

    // Fallback polling only if EventSource is not connected
    const fallbackInterval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        fetchFiles();
      }
    }, 12000);

    return () => {
      active = false;
      if (eventSource) eventSource.close();
      clearInterval(fallbackInterval);
    };
  }, [slug]);

  return { files, loading };
}
