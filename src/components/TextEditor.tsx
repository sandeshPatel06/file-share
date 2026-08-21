"use client";
import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2, Loader2, Sparkles, Copy, Check, Trash2,
  Quote, Link, Eye, Edit3, Columns, Paperclip, Smile, Code2, Code,
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List,
  ListOrdered, CheckSquare, Table, Image as ImageIcon, Minus
} from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { showToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/clipboard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface TextEditorProps {
  slug:           string;
  token:          string | null;
  initialContent?: string;
}

type SaveStatus = "idle" | "saving" | "saved";
type ViewMode = "write" | "split" | "preview";

// Emoji catalog for the quick picker
const EMOJI_CATEGORIES = [
  { label: "Smiles", emojis: ["😊", "😄", "🚀", "⚡", "🔥", "✨", "💡", "🎉", "👍", "❤️", "🙌", "🎯"] },
  { label: "Symbols", emojis: ["✅", "❌", "⚠️", "📌", "🔍", "💬", "📝", "📊", "🔒", "🔑", "🌐", "🛠️"] },
];

export function TextEditor({ slug, token, initialContent = "" }: TextEditorProps) {
  const { content: serverContent, loading, touchLocalEdit } = usePageContent(slug, initialContent);
  const [textVal, setTextVal] = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusEl = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayContent = textVal !== null ? textVal : (serverContent ?? initialContent);

  const updateStatusUI = (status: SaveStatus) => {
    if (statusEl.current) {
      statusEl.current.setAttribute("data-status", status);
    }
  };

  const saveContent = useCallback(async (newText: string, authToken: string | null) => {
    touchLocalEdit();
    try {
      const res = await fetch(`/api/pages/${slug}/content`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ content: newText }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [slug, touchLocalEdit]);

  const scheduleSave = useCallback((newText: string) => {
    updateStatusUI("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        const ok = await saveContent(newText, token);
        updateStatusUI(ok ? "saved" : "idle");
        if (ok) setTimeout(() => updateStatusUI("idle"), 2500);
      } catch {
        updateStatusUI("idle");
      }
    }, 600);
  }, [saveContent, token]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextVal(val);
    scheduleSave(val);
  };

  // Sync line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopyText = async () => {
    const ok = await copyToClipboard(displayContent);
    if (ok) {
      setCopied(true);
      showToast("Notes copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Failed to copy notes", "error");
    }
  };

  const handleClearText = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setTextVal("");
    updateStatusUI("saving");
    const ok = await saveContent("", token);
    updateStatusUI(ok ? "saved" : "idle");
    if (ok) {
      showToast("Notes cleared", "info");
      setTimeout(() => updateStatusUI("idle"), 2000);
    } else {
      showToast("Failed to clear notes", "error");
    }
  };

  // Helper to insert Markdown syntax around selection or cursor
  const applyFormat = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = displayContent;

    const selectedText = current.substring(start, end);
    const replacement = `${prefix}${selectedText || ""}${suffix}`;
    const nextContent = current.substring(0, start) + replacement + current.substring(end);

    setTextVal(nextContent);
    scheduleSave(nextContent);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 0);
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      const nextContent = displayContent + emoji;
      setTextVal(nextContent);
      scheduleSave(nextContent);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = displayContent;

    const nextContent = current.substring(0, start) + emoji + current.substring(end);
    setTextVal(nextContent);
    scheduleSave(nextContent);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + emoji.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
    setShowEmojiPicker(false);
  };

  // File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    showToast(`Uploading ${files.length} file(s)…`, "info");

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

    const formattedText = formattedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    if (formattedText === displayContent) {
      showToast("Notes are already formatted cleanly!", "info");
      return;
    }

    setTextVal(formattedText);
    scheduleSave(formattedText);
    showToast("AI Copilot formatted your notes cleanly!", "success");
  };

  const linesArray = displayContent.split("\n");
  const lineCount = Math.max(1, linesArray.length);
  const wordCount = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0;
  const charCount = displayContent.length;
  const readTime  = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] transition-colors duration-200 overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Sleek IDE Top Toolbar (100% Width) */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 gap-2 overflow-x-auto select-none min-h-[38px]">
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
              title="Task List (- [ ])"
              aria-label="Task List"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CheckSquare size={14} />
            </button>
            <button
              onClick={() => applyFormat("> ")}
              title="Blockquote (>)"
              aria-label="Blockquote"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Quote size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 hidden md:block" />

          <div className="hidden md:flex items-center gap-0.5 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => applyFormat("`", "`")}
              title="Inline Code (`code`)"
              aria-label="Inline Code"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Code size={14} />
            </button>
            <button
              onClick={() => applyFormat("```\n", "\n```")}
              title="Code Block (```)"
              aria-label="Code Block"
              className="p-1.5 rounded text-[var(--accent-indigo)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Code2 size={14} />
            </button>
            <button
              onClick={() => applyFormat("[", "](https://)")}
              title="Insert Link"
              aria-label="Insert Link"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Link size={14} />
            </button>
            <button
              onClick={() => applyFormat("![alt](", ")")}
              title="Insert Image"
              aria-label="Insert Image"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ImageIcon size={14} />
            </button>
            <button
              onClick={() => applyFormat("\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n")}
              title="Insert Table"
              aria-label="Insert Table"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Table size={14} />
            </button>
            <button
              onClick={() => applyFormat("\n---\n")}
              title="Horizontal Rule (---)"
              aria-label="Horizontal Rule"
              className="p-1.5 rounded text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Minus size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />

          {/* AI Copilot & Upload Buttons */}
          <button
            onClick={handleAICopilotFormat}
            className="p-1.5 rounded-lg bg-[var(--badge-bg)] text-[var(--accent-indigo)] border border-[var(--badge-border)] hover:border-[var(--accent-indigo)] transition-all cursor-pointer flex items-center gap-1 text-xs font-extrabold"
            title="AI Copilot Auto-Format Markdown"
          >
            <Sparkles size={13} />
            <span className="hidden xl:inline">AI Format</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach File"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin text-[var(--accent-indigo)]" /> : <Paperclip size={14} />}
          </button>

          {/* Emoji Popover */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
              aria-label="Insert Emoji"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Smile size={15} />
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 top-9 z-50 w-64 p-3 bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-slide-up">
                <div className="text-xs font-extrabold text-[var(--text-muted)] mb-2 px-1">Insert Emoji</div>
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="mb-2">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-subtle)] mb-1 px-1">{cat.label}</div>
                    <div className="grid grid-cols-6 gap-1">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1.5 text-base rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-125 cursor-pointer text-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: View Mode & Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-xs font-extrabold">
            <button
              onClick={() => setViewMode("write")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                viewMode === "write" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Raw Editor View"
            >
              <Edit3 size={12} />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                viewMode === "split" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Split View"
            >
              <Columns size={12} />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                viewMode === "preview" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Markdown Preview"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-color)] mx-0.5" />

          {/* Copy Button */}
          <button
            onClick={handleCopyText}
            className="p-1.5 sm:p-2 rounded-xl bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] transition-all shadow-sm cursor-pointer"
            title="Copy notes to clipboard"
          >
            {copied ? <Check size={14} className="text-[var(--status-success-text)]" /> : <Copy size={14} />}
          </button>

          {/* Clear Button */}
          <button
            onClick={() => setShowConfirmClear(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] hover:opacity-80 transition-all shadow-sm cursor-pointer"
            title="Clear all notes"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => {
          setShowConfirmClear(false);
          handleClearText();
        }}
        title="Clear All Notes?"
        description="Are you sure you want to clear all text content from this workspace? This action will sync live to all connected devices."
        confirmText="Clear Notes"
        variant="danger"
      />

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
                    onScroll={handleScroll}
                    placeholder="Type or paste Markdown here..."
                    aria-label="Notes markdown content editor"
                    className="w-full flex-1 resize-none bg-transparent text-[var(--text-main)] py-3 px-3 sm:px-4 outline-none font-mono text-[13px] sm:text-sm leading-[1.625rem] placeholder-[var(--text-subtle)] overflow-y-auto selection:bg-[var(--accent-indigo)]/20"
                    spellCheck="false"
                  />
                </div>
              </div>
            )}

            {/* Formatted Markdown Live Preview Pane */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="flex-1 h-full min-w-0 flex flex-col bg-[var(--bg-card)] overflow-hidden">
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-none">
                  <MarkdownRenderer content={displayContent} />
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
    </div>
  );
}
