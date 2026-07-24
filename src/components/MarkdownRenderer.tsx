"use client";
import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content.trim()) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--text-subtle)] italic select-none">
        Empty notes preview. Start typing in Write mode…
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="prose dark:prose-invert max-w-none text-xs md:text-sm font-sans leading-relaxed text-[var(--text-main)] space-y-2 select-text">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text-main)] pb-1 border-b border-[var(--border-color)] mt-4 mb-2">
              {renderInline(line.slice(2))}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-main)] pb-0.5 border-b border-[var(--border-color)]/60 mt-3 mb-2">
              {renderInline(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base md:text-lg font-bold text-[var(--accent-indigo)] mt-3 mb-1">
              {renderInline(line.slice(4))}
            </h3>
          );
        }

        // Horizontal Rule
        if (line.trim() === "---" || line.trim() === "***") {
          return <hr key={idx} className="my-4 border-t border-[var(--border-color)]" />;
        }

        // Blockquotes
        if (line.startsWith("> ")) {
          return (
            <blockquote key={idx} className="pl-3 border-l-4 border-[var(--accent-primary)] text-[var(--text-muted)] italic my-2 py-0.5 bg-[var(--badge-bg)] rounded-r-lg font-medium">
              {renderInline(line.slice(2))}
            </blockquote>
          );
        }

        // Task Checkboxes
        if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
          const checked = line.startsWith("- [x] ");
          return (
            <div key={idx} className="flex items-center gap-2 my-1 text-[var(--text-main)] font-medium">
              <input type="checkbox" checked={checked} readOnly className="rounded accent-[var(--accent-primary)]" />
              <span className={checked ? "line-through text-[var(--text-subtle)]" : ""}>
                {renderInline(line.slice(6))}
              </span>
            </div>
          );
        }

        // Unordered Lists
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={idx} className="ml-4 list-disc text-[var(--text-main)] my-0.5 font-medium">
              {renderInline(line.slice(2))}
            </li>
          );
        }

        // Code block single lines / Indented code
        if (line.startsWith("```") || line.endsWith("```")) {
          const codeText = line.replace(/```/g, "");
          return codeText ? (
            <pre key={idx} className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] font-mono text-xs text-[var(--accent-indigo)] overflow-x-auto my-2 font-bold">
              <code>{codeText}</code>
            </pre>
          ) : null;
        }

        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Regular Paragraph
        return (
          <p key={idx} className="my-1 leading-relaxed font-medium">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline formatting helper for Bold (**), Italic (*), Strikethrough (~~), and Inline Code (`)
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      parts.push(<strong key={keyIdx++} className="font-extrabold text-[var(--accent-indigo)]">{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Inline Code
    const codeMatch = remaining.match(/^`(.*?)`/);
    if (codeMatch) {
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-[var(--input-bg)] border border-[var(--border-color)] font-mono text-[11px] text-[var(--accent-cyan)] font-bold">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      parts.push(<em key={keyIdx++} className="italic text-[var(--text-main)] font-semibold">{italicMatch[2]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Strikethrough
    const strikeMatch = remaining.match(/^~~(.*?)~~/);
    if (strikeMatch) {
      parts.push(<span key={keyIdx++} className="line-through text-[var(--text-subtle)]">{strikeMatch[1]}</span>);
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Regular char
    const nextSpecial = remaining.search(/[\*_`~]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{parts}</>;
}
