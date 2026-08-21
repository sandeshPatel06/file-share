"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
  List, ListOrdered, CheckSquare, Quote, Code, Table, Sparkles,
  CheckCircle2, Loader2, Upload, Layout, Eye, Columns,
  Maximize2, Minimize2, Download, Printer, FileText, FileCode,
  Image as ImageIcon, FileSpreadsheet, ChevronDown, Check, FileJson
} from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { showToast } from "@/components/ui/Toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface TextEditorProps {
  slug: string;
  initialContent: string;
  token: string | null;
}

type ViewMode = "write" | "preview" | "split";

const TEMPLATES = [
  {
    id: "meeting",
    title: "📅 Meeting Notes",
    description: "Agenda, attendees, key decisions, and action items",
    content: `# 📅 Meeting Notes: [Topic]\n**Date**: ${new Date().toLocaleDateString()} | **Time**: 10:00 AM\n**Attendees**: @person1, @person2, @person3\n\n---\n\n## 🎯 Meeting Objectives\n- Objective 1\n- Objective 2\n\n---\n\n## 📝 Key Discussion Points\n1. Item 1: Summary of discussion\n2. Item 2: Summary of discussion\n\n---\n\n## 🚀 Action Items\n- [ ] Task 1 - Assigned to @person1\n- [ ] Task 2 - Assigned to @person2\n\n---\n\n## ✅ Final Decisions\n> Decision 1 reached during meeting.\n`,
  },
  {
    id: "kanban",
    title: "📋 Project Task Board",
    description: "To-do, in-progress, review, and done task list",
    content: `# 📋 Project Task Board\n\n---\n\n### ⏳ To Do\n- [ ] Design mockup reviews\n- [ ] Database schema migration\n- [ ] Unit test implementation\n\n---\n\n### 🏃 In Progress\n- [ ] API endpoint optimization\n- [ ] UI spacing & theme polish\n\n---\n\n### 🔍 In Review\n- [ ] User authentication flow\n\n---\n\n### ✅ Completed\n- [x] Initial project setup\n- [x] Database initial seeding\n`,
  },
  {
    id: "techspec",
    title: "🚀 Technical Specification",
    description: "Architecture roadmap, endpoints, and data model",
    content: `# 🚀 Tech Spec: [Feature Name]\n\n---\n\n## 1. Overview\nBrief description of problem statement and architecture design.\n\n---\n\n## 2. System Architecture\n\`\`\`mermaid\ngraph TD\n    A[Client UI] -->|HTTP Request| B[API Gateway]\n    B -->|Query| C[(SQLite DB)]\n    B -->|Push Event| D[SSE Event Engine]\n\`\`\`\n\n---\n\n## 3. API Contract\n| Method | Endpoint | Description |\n| :--- | :--- | :--- |\n| \`GET\` | \`/api/resource\` | Fetch list of resources |\n| \`POST\` | \`/api/resource\` | Create new resource |\n\n---\n\n## 4. Key Security Considerations\n- JWT Token Verification\n- Rate Limiting (100 req / min)\n`,
  },
  {
    id: "journal",
    title: "📔 Daily Work Log",
    description: "Today's wins, learnings, blockers, and notes",
    content: `# 📔 Work Log — ${new Date().toLocaleDateString()}\n\n---\n\n## 🏆 Key Accomplishments\n- Accomplishment 1\n- Accomplishment 2\n\n---\n\n## 💡 Learnings & Insights\n- Insight 1\n- Insight 2\n\n---\n\n## 🚧 Current Blockers\n- None\n\n---\n\n## 🎯 Tomorrow's Priorities\n- [ ] Priority 1\n- [ ] Priority 2\n`,
  },
];

export function TextEditor({ slug, initialContent, token }: TextEditorProps) {
  const { content: serverContent, loading, touchLocalEdit } = usePageContent(slug, initialContent);

  const [displayContent, setDisplayContent] = useState(initialContent);
  const [viewMode, setViewMode]             = useState<ViewMode>("split");
  const [uploading, setUploading]           = useState(false);
  const [zenMode, setZenMode]               = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOutline, setShowOutline]       = useState(false);
  
  // Slash Commands state
  const [slashMenu, setSlashMenu] = useState<{ open: boolean; filter: string; activeIndex: number }>({ 
    open: false, filter: "", activeIndex: 0 
  });

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef  = useRef<HTMLDivElement>(null);
  const previewRef      = useRef<HTMLDivElement>(null);
  const statusEl        = useRef<HTMLDivElement>(null);
  const exportMenuRef   = useRef<HTMLDivElement>(null);
  const lastPushedRef   = useRef<string>(initialContent);
  const debounceTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync server updates if user hasn't edited locally
  useEffect(() => {
    if (serverContent !== null && serverContent !== lastPushedRef.current) {
      setDisplayContent(serverContent);
      lastPushedRef.current = serverContent;
    }
  }, [serverContent]);

  // Keyboard shortcut for Zen Mode exit & export menu click-away
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (zenMode) setZenMode(false);
        if (showExportMenu) setShowExportMenu(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [zenMode, showExportMenu]);

  // Debounced auto-save push to API
  const pushUpdate = useCallback((val: string) => {
    touchLocalEdit();
    if (val === lastPushedRef.current) return;
    if (statusEl.current) statusEl.current.setAttribute("data-status", "saving");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pages/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content: val }),
        });

        if (res.ok) {
          lastPushedRef.current = val;
          if (statusEl.current) statusEl.current.setAttribute("data-status", "saved");
          setTimeout(() => {
            if (statusEl.current && statusEl.current.getAttribute("data-status") === "saved") {
              statusEl.current.setAttribute("data-status", "idle");
            }
          }, 2000);
        } else {
          if (statusEl.current) statusEl.current.setAttribute("data-status", "error");
        }
      } catch {
        if (statusEl.current) statusEl.current.setAttribute("data-status", "error");
      }
    }, 400);
  }, [slug, token, touchLocalEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDisplayContent(val);
    pushUpdate(val);
    
    // Slash Menu Detection
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursor);
    const lastLine = textBeforeCursor.split('\n').pop() || "";
    
    // If the line starts with an optional whitespace and a slash, followed by alphabetical chars
    if (lastLine.match(/^\s*\/[a-zA-Z]*$/)) {
      setSlashMenu(prev => ({ 
        open: true, 
        filter: lastLine.replace(/^\s*\//, "").toLowerCase(), 
        activeIndex: prev.open ? prev.activeIndex : 0 
      }));
    } else {
      setSlashMenu({ open: false, filter: "", activeIndex: 0 });
    }
  };

  // Slash Menu Options
  const slashOptions = [
    { id: "h1", icon: <Heading1 size={14} />, label: "Heading 1", insert: "# " },
    { id: "h2", icon: <Heading2 size={14} />, label: "Heading 2", insert: "## " },
    { id: "h3", icon: <Heading3 size={14} />, label: "Heading 3", insert: "### " },
    { id: "todo", icon: <CheckSquare size={14} />, label: "To-do list", insert: "- [ ] " },
    { id: "ul", icon: <List size={14} />, label: "Bulleted list", insert: "- " },
    { id: "code", icon: <Code size={14} />, label: "Code block", insert: "```\n\n```" },
    { id: "table", icon: <Table size={14} />, label: "Table", insert: "| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n" }
  ];
  const filteredSlashOptions = slashOptions.filter(o => o.label.toLowerCase().includes(slashMenu.filter));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenu.open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashMenu(prev => ({ ...prev, activeIndex: (prev.activeIndex + 1) % filteredSlashOptions.length }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashMenu(prev => ({ ...prev, activeIndex: (prev.activeIndex - 1 + filteredSlashOptions.length) % filteredSlashOptions.length }));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredSlashOptions.length > 0) {
          executeSlashCommand(filteredSlashOptions[slashMenu.activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenu({ open: false, filter: "", activeIndex: 0 });
      }
    }
  };

  const executeSlashCommand = (option: typeof slashOptions[0]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursor = textarea.selectionStart;
    const textBeforeCursor = displayContent.substring(0, cursor);
    const textAfterCursor = displayContent.substring(textarea.selectionEnd);
    
    // Find where the slash command started on the current line
    const lastNewlineIdx = textBeforeCursor.lastIndexOf('\n');
    const lineStart = lastNewlineIdx === -1 ? 0 : lastNewlineIdx + 1;
    const textBeforeLine = displayContent.substring(0, lineStart);
    const currentLine = textBeforeCursor.substring(lineStart);
    
    // Replace the slash and filter text with the actual command
    const leadingSpaces = currentLine.match(/^\s*/)?.[0] || "";
    const replacement = leadingSpaces + option.insert;
    
    const newContent = textBeforeLine + replacement + textAfterCursor;
    setDisplayContent(newContent);
    pushUpdate(newContent);
    setSlashMenu({ open: false, filter: "", activeIndex: 0 });
    
    setTimeout(() => {
      textarea.focus();
      let newCursor = textBeforeLine.length + replacement.length;
      if (option.id === "code") newCursor -= 4; // place cursor inside the backticks
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // Sync line numbers and preview scrolling with editor textarea
  const handleScroll = () => {
    if (textareaRef.current) {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (previewRef.current) {
        const textH = textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
        const prevH = previewRef.current.scrollHeight - previewRef.current.clientHeight;
        if (textH > 0 && prevH > 0) {
          const ratio = textareaRef.current.scrollTop / textH;
          previewRef.current.scrollTop = ratio * prevH;
        }
      }
    }
  };

  // Feature: Interactive Task Checkboxes in Preview
  const handleToggleTask = (lineIndex: number, checked: boolean) => {
    const lines = displayContent.split(/\r?\n/);
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      // Replace - [ ] or - [x] or - [X]
      const replaced = line.replace(/-\s*\[([ xX])\]/, checked ? "- [x]" : "- [ ]");
      lines[lineIndex] = replaced;
      const newContent = lines.join('\n');
      setDisplayContent(newContent);
      pushUpdate(newContent);
    }
  };

  // Format Helper Injection
  const applyFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = displayContent.substring(start, end);

    let replacement = "";
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = prefix.endsWith(" ") || prefix.endsWith("\n") ? `${prefix}` : `${prefix}text${suffix}`;
    }

    const newContent = displayContent.substring(0, start) + replacement + displayContent.substring(end);
    setDisplayContent(newContent);
    pushUpdate(newContent);

    setTimeout(() => {
      textarea.focus();
      const cursorOffset = selectedText ? start + replacement.length : start + prefix.length;
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  // Image / File Upload Helper
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/pages/${slug}/files/upload`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          showToast(data.error ?? "Failed to upload file", "error");
        } else {
          showToast(`Uploaded ${file.name}`, "success");
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("files_updated"));
      }
    } catch {
      showToast("Upload failed due to connection error", "error");
    } finally {
      setUploading(false);
    }
  };

  // AI Copilot Auto Format Assistant
  const handleAICopilotFormat = () => {
    if (!displayContent.trim()) {
      showToast("Type notes first for AI Copilot to format", "info");
      return;
    }

    const lines = displayContent.split(/\r?\n/);
    let inCodeBlock = false;
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        formattedLines.push(line.trimEnd());
        continue;
      }

      if (inCodeBlock) {
        formattedLines.push(line.trimEnd());
        continue;
      }

      let trimmed = line.trimEnd();
      trimmed = trimmed.replace(/^(#{1,6})([^#\s])/g, "$1 $2");
      trimmed = trimmed.replace(/^(\s*)[*+]\s+/g, "$1- ");
      trimmed = trimmed.replace(/^(\s*)-\s*([^\s\-[\]])/g, "$1- $2");
      trimmed = trimmed.replace(/^(\s*)-\s*\[([ xX])\]\s*([^\s])/g, "$1- [$2] $3");
      trimmed = trimmed.replace(/^(\s*\d+\.)([^\s])/g, "$1 $2");
      trimmed = trimmed.replace(/^(\s*>)([^\s>])/g, "$1 $2");
      trimmed = trimmed.replace(/([a-zA-Z0-9_)]),(?=[a-zA-Z0-9_(])/g, "$1, ");

      formattedLines.push(trimmed);
    }

    let cleanedText = formattedLines.join("\n").replace(/\n{3,}/g, "\n\n");
    if (!cleanedText.endsWith("\n")) {
      cleanedText += "\n";
    }

    setDisplayContent(cleanedText);
    pushUpdate(cleanedText);
    showToast("Markdown document formatted with AI Copilot!", "success");
  };

  // Insert Template Content
  const insertTemplate = (templateContent: string) => {
    const newContent = displayContent.trim()
      ? `${displayContent}\n\n${templateContent}`
      : templateContent;
    setDisplayContent(newContent);
    pushUpdate(newContent);
    setShowTemplateModal(false);
    showToast("Starter template inserted!", "success");
  };

  // Export Engine Functions
  const downloadFile = (contentStr: string, filename: string, mime: string) => {
    const blob = new Blob([contentStr], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    downloadFile(displayContent, `${slug}.md`, "text/markdown");
    setShowExportMenu(false);
    showToast("Exported Markdown (.md) file!", "success");
  };

  const handleExportText = () => {
    downloadFile(displayContent, `${slug}.txt`, "text/plain");
    setShowExportMenu(false);
    showToast("Exported Plain Text (.txt) file!", "success");
  };

  const handleExportJSON = () => {
    const dataObj = {
      content: displayContent,
      wordCount,
      charCount,
      lineCount,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(JSON.stringify(dataObj, null, 2), `${slug}.json`, "application/json");
    setShowExportMenu(false);
    showToast("Exported JSON dataset!", "success");
  };

  const handleExportHTML = () => {
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #0f172a; background: #ffffff; line-height: 1.6; }
    h1, h2, h3 { color: #0f172a; font-weight: 800; }
    pre { background: #0d1117; color: #e6edf3; padding: 16px; border-radius: 12px; overflow-x: auto; }
    code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; color: #0969da; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
    blockquote { border-left: 4px solid #10b981; margin: 0; padding-left: 16px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
  <div style="font-size: 14px; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">${displayContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
</body>
</html>`;
    downloadFile(htmlDoc, `${slug}.html`, "text/html");
    setShowExportMenu(false);
    showToast("Exported HTML document!", "success");
  };

  const handleExportImage = () => {
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; background: #0d1117; color: #e6edf3; min-height: 1000px; box-sizing: border-box;">
          <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-family: monospace; opacity: 0.9;">${displayContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </div>
      </foreignObject>
    </svg>`;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `${slug}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, "image/png");
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;

    setShowExportMenu(false);
    showToast("Exported Image (.png) snapshot!", "success");
  };

  const handlePrintPDF = () => {
    setShowExportMenu(false);

    // Create an isolated iframe for clean document print export
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document Export</title>
  <style>
    @page { margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; line-height: 1.6; padding: 0; margin: 0; }
    h1, h2, h3 { color: #0f172a; font-weight: 800; }
    pre { background: #0d1117; color: #e6edf3; padding: 16px; border-radius: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
    code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; color: #0969da; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; }
    blockquote { border-left: 4px solid #10b981; margin: 0; padding-left: 16px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
  <div style="font-size: 14px; white-space: pre-wrap; font-family: monospace;">${displayContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
      }, 1000);
    }, 250);
  };

  const lineCount = displayContent.split("\n").length;
  const wordCount = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0;
  const charCount = displayContent.length;
  const readTime  = Math.max(1, Math.ceil(wordCount / 200));

  // Feature 3: Checklist Progress Tracker
  const taskCheckboxes = displayContent.match(/-\s*\[([ xX])\]/g) || [];
  const completedTasks = displayContent.match(/-\s*\[([xX])\]/g) || [];
  const totalTasks = taskCheckboxes.length;
  const completedCount = completedTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Feature 2: Table of Contents (Outline)
  const headings = displayContent
    .split("\n")
    .filter((line) => /^#{1,3}\s/.test(line))
    .map((line) => {
      const level = line.match(/^#{1,3}/)?.[0].length || 1;
      const text = line.replace(/^#{1,3}\s/, "");
      // simple slugification for anchors
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return { level, text, id };
    });

  return (
    <div className={`
      flex flex-col h-full w-full bg-[var(--bg-main)] transition-all duration-200 overflow-hidden select-none
      ${zenMode ? "fixed inset-0 z-[9999] bg-[var(--bg-main)]" : "relative"}
    `}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Sleek IDE Top Toolbar (100% Width) */}
      <div className="relative z-20 flex items-center justify-between px-2.5 py-1 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 gap-2 select-none min-h-[38px]">
        {/* Left: Markdown Format Icons Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap shrink-0">
          <div className="flex items-center gap-0.5 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => applyFormat("# ")}
              title="Heading 1 (#)"
              aria-label="Heading 1"
              className="p-1.5 rounded text-xs font-black text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Heading1 size={14} />
            </button>
            <button
              onClick={() => applyFormat("## ")}
              title="Heading 2 (##)"
              aria-label="Heading 2"
              className="p-1.5 rounded text-xs font-black text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Heading2 size={14} />
            </button>
            <button
              onClick={() => applyFormat("### ")}
              title="Heading 3 (###)"
              aria-label="Heading 3"
              className="p-1.5 rounded text-xs font-black text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Heading3 size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />

          <div className="flex items-center gap-0.5 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => applyFormat("**", "**")}
              title="Bold (**text**)"
              aria-label="Bold"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => applyFormat("*", "*")}
              title="Italic (*text*)"
              aria-label="Italic"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => applyFormat("~~", "~~")}
              title="Strikethrough (~~text~~)"
              aria-label="Strikethrough"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Strikethrough size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-0.5 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => applyFormat("- ")}
              title="Unordered List (-)"
              aria-label="Unordered List"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => applyFormat("1. ")}
              title="Numbered List (1.)"
              aria-label="Numbered List"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ListOrdered size={14} />
            </button>
            <button
              onClick={() => applyFormat("- [ ] ")}
              title="Task Checkbox (- [ ])"
              aria-label="Task Checkbox"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CheckSquare size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 hidden md:block" />

          <div className="hidden md:flex items-center gap-0.5 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => applyFormat("> ")}
              title="Blockquote (>)"
              aria-label="Blockquote"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Quote size={14} />
            </button>
            <button
              onClick={() => applyFormat("```\n", "\n```")}
              title="Code Block (```)"
              aria-label="Code Block"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Code size={14} />
            </button>
            <button
              onClick={() => applyFormat("| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n")}
              title="Insert Table"
              aria-label="Insert Table"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Table size={14} />
            </button>
          </div>
        </div>

        {/* Right: AI Assistant, Templates, Export, Zen, & View Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Starter Templates Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-all text-xs font-bold cursor-pointer"
            title="Starter Templates Gallery"
          >
            <FileText size={13} className="text-[var(--accent-indigo)]" />
            <span className="hidden lg:inline">Templates</span>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={handleAICopilotFormat}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[var(--accent-indigo)] hover:bg-emerald-500/20 transition-all text-xs font-bold cursor-pointer shadow-sm"
            title="AI Copilot: Auto-format document"
          >
            <Sparkles size={13} className="text-[var(--accent-indigo)] animate-pulse" />
            <span className="hidden sm:inline">AI Format</span>
          </button>

          {/* Outline / ToC Toggle */}
          <button
            onClick={() => setShowOutline(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showOutline 
                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white" 
                : "bg-[var(--badge-bg)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)]"
            }`}
            title="Toggle Document Outline"
          >
            <ListOrdered size={13} />
          </button>

          {/* Attach File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-1.5 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-all cursor-pointer"
            title="Attach file to notes"
          >
            <Upload size={13} />
          </button>

          {/* Rich Export Menu Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold shadow-sm"
              title="Export Document Options"
            >
              <Download size={13} className="text-[var(--accent-indigo)]" />
              <span>Export</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--modal-bg)] border border-[var(--border-color)] shadow-2xl p-1 z-[100] animate-slide-down text-xs font-bold">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <FileText size={14} className="text-[var(--accent-indigo)]" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={handleExportHTML}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <FileCode size={14} className="text-[var(--accent-sky)]" />
                  <span>HTML Document</span>
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <Printer size={14} className="text-purple-400" />
                  <span>PDF Document</span>
                </button>
                <button
                  onClick={handleExportImage}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <ImageIcon size={14} className="text-emerald-400" />
                  <span>Image (.png)</span>
                </button>
                <div className="my-1 border-t border-[var(--border-color)]" />
                <button
                  onClick={handleExportText}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-amber-400" />
                  <span>Plain Text (.txt)</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer"
                >
                  <FileJson size={14} className="text-rose-400" />
                  <span>JSON Dataset (.json)</span>
                </button>
              </div>
            )}
          </div>

          {/* Zen Focus Mode Toggle */}
          <button
            onClick={() => setZenMode(!zenMode)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              zenMode
                ? "bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-sm"
                : "bg-[var(--badge-bg)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--border-color)]"
            }`}
            title={zenMode ? "Exit Zen Mode (Esc)" : "Zen Focus Writing Mode"}
          >
            {zenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* View Mode Toggle Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode("write")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === "write" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Write Mode"
            >
              <Layout size={13} />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`p-1 rounded transition-colors cursor-pointer hidden sm:block ${
                viewMode === "split" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Split View"
            >
              <Columns size={13} />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === "preview" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Preview Mode"
            >
              <Eye size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Canvas (Full Width & Height, Zero Outer Padding) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative bg-[var(--bg-main)]">
        {loading ? (
          <div className="w-full space-y-4 animate-pulse p-6">
            {[85, 70, 92, 60, 78].map((w, i) => (
              <div key={i} className="skeleton h-5 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex min-h-0 overflow-hidden">
            {/* Outline Sidebar Pane */}
            {showOutline && (
              <div className="w-48 sm:w-64 h-full min-w-0 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-color)] overflow-hidden shrink-0 animate-fade-in">
                <div className="px-3 py-2.5 border-b border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--text-main)] uppercase tracking-wider">Outline</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {headings.length === 0 ? (
                    <p className="text-xs text-[var(--text-subtle)] italic">No headings found in document.</p>
                  ) : (
                    headings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(h.id);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`block text-xs truncate hover:text-[var(--accent-indigo)] transition-colors cursor-pointer py-1 ${
                          h.level === 1 ? "font-bold text-[var(--text-main)] mt-2" :
                          h.level === 2 ? "font-medium text-[var(--text-muted)] ml-3" :
                          "text-[var(--text-subtle)] ml-6"
                        }`}
                        title={h.text}
                      >
                        {h.text}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Writer Pane */}
            {(viewMode === "write" || viewMode === "split") && (
              <div className="flex-1 h-full min-w-0 flex flex-col bg-[var(--bg-card)] relative overflow-hidden border-r border-[var(--border-color)]">
                <div className="flex-1 flex min-h-0 relative overflow-hidden">
                  {/* Line Numbers Gutter */}
                  <div
                    ref={lineNumbersRef}
                    className="select-none py-3 px-2 text-right font-mono text-xs text-[var(--text-subtle)] bg-[var(--bg-surface)]/50 border-r border-[var(--border-color)] shrink-0 overflow-hidden text-opacity-40 select-none hidden sm:block min-w-[42px]"
                    aria-hidden="true"
                  >
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i + 1} className="leading-[1.625rem] text-[13px]">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Main Editor Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={displayContent}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    placeholder="Type or paste Markdown here... (Type '/' for commands)"
                    aria-label="Notes markdown content editor"
                    className="w-full flex-1 resize-none bg-transparent text-[var(--text-main)] py-3 px-3 sm:px-4 outline-none font-mono text-[13px] sm:text-sm leading-[1.625rem] placeholder-[var(--text-subtle)] overflow-y-auto selection:bg-[var(--accent-indigo)]/20 relative z-10"
                    spellCheck="false"
                  />

                  {/* Floating Slash Commands Menu */}
                  {slashMenu.open && filteredSlashOptions.length > 0 && (
                    <div 
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in"
                    >
                      <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                        <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                          Basic Blocks
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                        {filteredSlashOptions.map((opt, i) => (
                          <div
                            key={opt.id}
                            onClick={() => executeSlashCommand(opt)}
                            onMouseEnter={() => setSlashMenu(prev => ({ ...prev, activeIndex: i }))}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              i === slashMenu.activeIndex 
                                ? "bg-[var(--accent-primary)] text-white" 
                                : "text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                            }`}
                          >
                            <div className={i === slashMenu.activeIndex ? "text-white" : "text-[var(--text-muted)]"}>
                              {opt.icon}
                            </div>
                            <span className="text-xs font-bold">{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formatted Markdown Live Preview Pane */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="flex-1 h-full min-w-0 flex flex-col bg-[var(--bg-card)] overflow-hidden">
                <div ref={previewRef} className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-none scroll-smooth">
                  <MarkdownRenderer content={displayContent} onToggleTask={handleToggleTask} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Bar (Markdown Viewer Style) */}
      <div className="h-6 px-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>⏱️ {readTime} Min Read</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">📝 {wordCount} Words</span>
          <span>·</span>
          <span>🔤 {charCount} Chars</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">📄 {lineCount} Lines</span>
          {totalTasks > 0 && (
            <>
              <span className="hidden md:inline">·</span>
              <span className="hidden md:flex items-center gap-1.5" title={`${completedCount} of ${totalTasks} tasks completed`}>
                <CheckSquare size={11} className={completedCount === totalTasks ? "text-[var(--status-success-text)]" : ""} />
                <div className="w-16 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-[var(--status-success-text)] transition-all duration-300"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold">{taskProgress}%</span>
              </span>
            </>
          )}
        </div>

        <div ref={statusEl} data-status="idle" className="flex items-center gap-2">
          <div className="[div[data-status='saving']_&]:flex hidden items-center gap-1.5 text-[var(--badge-text)] font-bold">
            <Loader2 size={11} className="animate-spin text-[var(--accent-indigo)]" />
            <span>Syncing…</span>
          </div>
          <div className="[div[data-status='saved']_&]:flex hidden items-center gap-1.5 text-[var(--status-success-text)] font-bold">
            <CheckCircle2 size={11} />
            <span>All changes saved</span>
          </div>
          <div className="[div[data-status='idle']_&]:flex hidden items-center gap-1.5 text-[var(--text-subtle)]">
            <Sparkles size={11} className="text-[var(--accent-indigo)]" />
            <span>Auto-sync active</span>
          </div>
        </div>
      </div>

      {/* Starter Templates Modal */}
      <Modal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Starter Markdown Templates" maxWidth="max-w-md">
        <div className="grid grid-cols-1 gap-2.5 pt-0.5">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => insertTemplate(tmpl.content)}
              className="group p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all cursor-pointer flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold text-[var(--text-main)] group-hover:text-[var(--accent-indigo)] transition-colors">
                  {tmpl.title}
                </span>
                <Button size="xs" variant="secondary" icon={<Check size={11} />}>
                  Insert
                </Button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">
                {tmpl.description}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
