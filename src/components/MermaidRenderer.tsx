"use client";
import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  chart: string;
}

interface MermaidAPI {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string | null, code: string) => Promise<{ svg: string }>;
}

declare global {
  interface Window {
    mermaid?: MermaidAPI;
  }
}

/**
 * Renders a Mermaid diagram string into an SVG.
 * Loads mermaid dynamically from CDN to avoid bundling it.
 */
export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const idRef = useRef<string | null>(null);

  // Generate a stable ID once on mount
  if (idRef.current === null) {
    idRef.current = `mermaid-${crypto.randomUUID().slice(0, 8)}`;
  }

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const existingScript = document.querySelector("script[data-mermaid]");
        const mermaid = window.mermaid;

        if (mermaid) {
          if (cancelled) return;
          const { svg: rendered } = (await mermaid.render(idRef.current, chart)) as { svg: string };
          if (!cancelled) setSvg(rendered);
        } else if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
          script.setAttribute("data-mermaid", "true");
          script.onload = async () => {
            const m = window.mermaid;
            if (m && !cancelled) {
              m.initialize({ startOnLoad: false, theme: "default" });
              try {
                const { svg: rendered } = (await m.render(idRef.current, chart)) as { svg: string };
                if (!cancelled) setSvg(rendered);
              } catch (err: unknown) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Mermaid render error");
              }
            }
          };
          script.onerror = () => {
            if (!cancelled) setError("Failed to load Mermaid library");
          };
          document.head.appendChild(script);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Mermaid render error");
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
        <p className="text-xs font-mono text-red-400 mb-2 font-bold">Mermaid Diagram Error</p>
        <pre className="text-xs font-mono text-[var(--text-subtle)] overflow-x-auto whitespace-pre-wrap">{chart}</pre>
        <p className="text-[10px] text-red-400/70 mt-1">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 p-6 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--accent-indigo)] border-t-transparent rounded-full animate-spin" />
          Loading diagram…
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-2.5 p-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1e1e2e] overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
