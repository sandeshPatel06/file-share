"use client";
import React, { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { MermaidRenderer } from "@/components/MermaidRenderer";

interface MarkdownRendererProps {
  content: string;
  onToggleTask?: (lineIndex: number, checked: boolean) => void;
}

/**
 * Full-featured Markdown renderer supporting:
 * - GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks)
 * - Syntax-highlighted fenced code blocks
 * - Mermaid diagrams via ```mermaid fences
 * - Raw HTML passthrough (for embedded rich content)
 * - Heading anchor IDs (`rehype-slug`)
 */
export function MarkdownRenderer({ content, onToggleTask }: MarkdownRendererProps) {
  if (!content.trim()) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--text-subtle)] italic select-none">
        Empty notes preview. Start typing in Write mode…
      </div>
    );
  }

  // Feature 4: Bidirectional Page Linking
  // Convert [[slug]] to [slug](/s/slug) outside of code blocks
  const parseBidirectionalLinks = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const inlineParts = parts[i].split(/(`[^`]+`)/g);
        for (let j = 0; j < inlineParts.length; j++) {
          if (j % 2 === 0) {
            inlineParts[j] = inlineParts[j].replace(/\[\[(.*?)\]\]/g, (match, p1) => {
              const cleanSlug = p1.trim();
              return `[${cleanSlug}](/s/${cleanSlug})`;
            });
          }
        }
        parts[i] = inlineParts.join("");
      }
    }
    return parts.join("");
  };

  const parsedContent = parseBidirectionalLinks(content);

  return (
    <div className="max-w-none text-sm leading-relaxed text-[var(--text-main)] select-text markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
        components={{
          // ── Code blocks: detect mermaid fences ──
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];
            const codeStr = String(children).replace(/\n$/, "");

            // Mermaid diagram block
            if (lang === "mermaid") {
              return <MermaidRenderer chart={codeStr} />;
            }

            // Inline code (no language class)
            if (!lang) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-[var(--input-bg)] border border-[var(--border-color)] font-mono text-[0.8125rem] text-[var(--accent-cyan)] font-bold"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Fenced code block with syntax highlighting
            return (
              <div className="my-2.5 rounded-xl border border-[var(--border-color)] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-extrabold">
                    {lang}
                  </span>
                  <CopyCodeButton code={codeStr} />
                </div>
                <pre className="p-3 bg-[var(--input-bg)] overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
                  <code className={`hljs language-${lang} bg-transparent`} {...props}>
                    {codeStr}
                  </code>
                </pre>
              </div>
            );
          },

          // ── Tables ──
          table({ children }) {
            return (
              <div className="my-2.5 overflow-x-auto rounded-xl border border-[var(--border-color)]">
                <table className="min-w-full text-xs md:text-sm border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-[var(--bg-surface)] border-b-2 border-[var(--border-color)]">{children}</thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-[var(--border-color)]">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-[var(--bg-surface)]/50 transition-colors">{children}</tr>;
          },
          th({ children, style }) {
            return (
              <th style={style} className="px-2.5 py-1.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] border-r border-[var(--border-color)] last:border-r-0">
                {children}
              </th>
            );
          },
          td({ children, style }) {
            return (
              <td style={style} className="px-2.5 py-1.5 border-r border-[var(--border-color)] last:border-r-0">
                {children}
              </td>
            );
          },

          // ── Blockquotes ──
          blockquote({ children }) {
            return (
              <blockquote className="my-2.5 pl-3.5 border-l-4 border-[var(--accent-indigo)] bg-[var(--badge-bg)] text-[var(--text-main)] italic rounded-r-xl py-1.5 pr-3">
                {children}
              </blockquote>
            );
          },

          // ── Links ──
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-sky)] underline underline-offset-2 decoration-[var(--accent-sky)]/40 hover:decoration-[var(--accent-sky)] transition-colors font-medium"
              >
                {children}
              </a>
            );
          },

          // ── Images ──
          img({ src, alt }) {
            if (!src) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt || ""}
                className="my-2.5 rounded-xl max-w-full h-auto border border-[var(--border-color)] shadow-md"
                loading="lazy"
              />
            );
          },

          // ── Horizontal Rule ──
          hr() {
            return <hr className="my-4 border-t-2 border-[var(--border-color)]" />;
          },

          // ── Headings ──
          h1({ children, id }) {
            return (
              <h1 id={id} className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text-main)] pb-1 border-b border-[var(--border-color)] mt-4 mb-2">
                {children}
              </h1>
            );
          },
          h2({ children, id }) {
            return (
              <h2 id={id} className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-main)] pb-0.5 border-b border-[var(--border-color)]/60 mt-3.5 mb-1.5">
                {children}
              </h2>
            );
          },
          h3({ children, id }) {
            return (
              <h3 id={id} className="text-base md:text-lg font-bold text-[var(--accent-indigo)] mt-3 mb-1">
                {children}
              </h3>
            );
          },
          h4({ children, id }) {
            return (
              <h4 id={id} className="text-sm md:text-base font-bold text-[var(--text-main)] mt-2.5 mb-1">
                {children}
              </h4>
            );
          },

          // ── Lists ──
          ul({ children }) {
            return <ul className="my-1.5 pl-5 space-y-0.5 list-disc marker:text-[var(--accent-primary)]">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-1.5 pl-5 space-y-0.5 list-decimal marker:text-[var(--text-muted)] marker:font-bold">{children}</ol>;
          },
          li({ children }) {
            const hasTask = hasTaskCheckbox(children);
            if (hasTask) {
              return <li className="my-0.5 list-none -ml-5">{children}</li>;
            }
            return <li className="my-0.5 pl-1">{children}</li>;
          },

          // ── Task checkbox rendering ──
          input({ type, checked, disabled, id, node, ...props }) {
            if (type === "checkbox") {
              const lineIndex = node?.position?.start?.line;
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!onToggleTask}
                  onChange={(e) => {
                    if (onToggleTask && lineIndex) {
                      onToggleTask(lineIndex - 1, e.target.checked); // 0-indexed line
                    }
                  }}
                  id={id}
                  className={`rounded accent-[var(--accent-primary)] mr-2 align-middle ${onToggleTask ? 'cursor-pointer' : ''}`}
                />
              );
            }
            return <input type={type} checked={checked} disabled={disabled} id={id} {...props} />;
          },

          // ── Paragraphs ──
          p({ children }) {
            if (isValidElement(children) && children.type === "img") {
              return <>{children}</>;
            }
            return <p className="my-1.5 leading-relaxed">{children}</p>;
          },

          // ── Strong / Bold ──
          strong({ children }) {
            return <strong className="font-extrabold text-[var(--accent-indigo)]">{children}</strong>;
          },

          // ── Emphasis / Italic ──
          em({ children }) {
            return <em className="italic font-semibold">{children}</em>;
          },

          // ── Deleted / Strikethrough ──
          del({ children }) {
            return <del className="line-through text-[var(--text-subtle)]">{children}</del>;
          },
        }}
      >
        {parsedContent}
      </ReactMarkdown>
    </div>
  );
}

// ── Helpers ──

function hasTaskCheckbox(children: React.ReactNode): boolean {
  if (!children) return false;
  if (isValidElement(children)) {
    const props = children.props as Record<string, unknown>;
    if (children.type === "input" && props.type === "checkbox") {
      return true;
    }
    if (props.children) {
      return hasTaskCheckbox(props.children as React.ReactNode);
    }
  }
  if (Array.isArray(children)) {
    return children.some((c) => hasTaskCheckbox(c));
  }
  return false;
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
      document.body.removeChild(textarea);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--accent-indigo)] transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-[var(--badge-bg)]"
      title="Copy code"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
