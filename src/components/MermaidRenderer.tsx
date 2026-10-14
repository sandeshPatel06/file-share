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
 * Dark readability: follows app theme — `dark` mermaid theme on
 * bg-surface (#161b22) with light text; `default` theme in light mode.
 * Error/loading states use danger/muted tokens (no low-contrast subtle/opacity).
 */
export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => getIsDark());

  // Track theme flips (next-themes `class` attribute) so diagrams re-render
  // with the matching mermaid theme instead of staying stuck in light/dark.
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(getIsDark()));
    observer.observe(el, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const existingScript = document.querySelector("script[data-mermaid]");
        const mermaid = window.mermaid;

        const initMermaid = (m: MermaidAPI) => {
          m.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: isDark ? "dark" : "default",
            themeVariables: isDark
              ? {
                  background: "#161b22",
                  primaryColor: "#21262d",
                  primaryTextColor: "#e6edf3",
                  primaryBorderColor: "#30363d",
                  lineColor: "#a2abb7",
                  textColor: "#e6edf3",
                }
              : undefined,
          });
        };

        // Fresh id per render — mermaid v11 rejects duplicate render ids.
        const renderId = `mermaid-${crypto.randomUUID().slice(0, 8)}`;

        if (mermaid) {
          if (cancelled) return;
          initMermaid(mermaid);
          try {
            const { svg: rendered } = (await mermaid.render(renderId, chart)) as { svg: string };
            if (!cancelled) {
              setSvg(rendered);
              setError(null);
            }
          } catch (err: unknown) {
            if (!cancelled) {
              setSvg(null);
              setError(err instanceof Error ? err.message : "Mermaid render error");
            }
          }
        } else if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
          script.setAttribute("data-mermaid", "true");
          script.onload = async () => {
            const m = window.mermaid;
            if (m && !cancelled) {
              initMermaid(m);
              try {
                const { svg: rendered } = (await m.render(renderId, chart)) as { svg: string };
                if (!cancelled) {
                  setSvg(rendered);
                  setError(null);
                }
              } catch (err: unknown) {
                if (!cancelled) {
                  setSvg(null);
                  setError(err instanceof Error ? err.message : "Mermaid render error");
                }
              }
            }
          };
          script.onerror = () => {
            if (!cancelled) {
              setSvg(null);
              setError("Failed to load Mermaid library");
            }
          };
          document.head.appendChild(script);
        } else {
          // Script tag exists but library not ready yet — poll briefly.
          const poll = window.setInterval(async () => {
            const m = window.mermaid;
            if (m) {
              window.clearInterval(poll);
              if (cancelled) return;
              try {
                initMermaid(m);
                const { svg: rendered } = (await m.render(renderId, chart)) as { svg: string };
                if (!cancelled) {
                  setSvg(rendered);
                  setError(null);
                }
              } catch (err: unknown) {
                if (!cancelled) {
                  setSvg(null);
                  setError(err instanceof Error ? err.message : "Mermaid render error");
                }
              }
            }
          }, 100);
          window.setTimeout(() => window.clearInterval(poll), 5000);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setSvg(null);
          setError(err instanceof Error ? err.message : "Mermaid render error");
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart, isDark]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]">
        <p className="text-xs font-mono text-[var(--status-danger-text)] mb-2 font-bold">Mermaid Diagram Error</p>
        <pre className="text-xs font-mono text-[var(--text-muted)] overflow-x-auto whitespace-pre-wrap max-w-full break-all [overflow-wrap:anywhere]">{chart}</pre>
        <p className="text-xs text-[var(--status-danger-text)] mt-1">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-center">
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
      className="my-2.5 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-x-auto max-w-full min-w-0 block text-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function getIsDark(): boolean {
  if (typeof document === "undefined") return true; // defaultTheme is dark
  const el = document.documentElement;
  if (el.classList.contains("light")) return false;
  if (el.classList.contains("dark")) return true;
  if (el.dataset.theme === "light") return false;
  if (el.dataset.theme === "dark") return true;
  if (typeof window !== "undefined" && window.matchMedia) {
    return !window.matchMedia("(prefers-color-scheme: light)").matches;
  }
  return true;
}
