"use client";
import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2, Loader2, FileEdit, Sparkles, Copy, Check, Trash2,
  Quote, Link, Eye, Edit3, Columns, Paperclip, Mic, Video, Monitor, FileCode,
  Smile, Type, Code2
} from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { showToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/clipboard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface TextEditorProps {
  slug:  string;
  token: string | null;
}

type SaveStatus = "idle" | "saving" | "saved";
type ViewMode = "write" | "split" | "preview";

// Emoji catalog for the Zoho Cliq style picker
const EMOJI_CATEGORIES = [
  { label: "Smiles", emojis: ["😊", "😄", "🚀", "⚡", "🔥", "✨", "💡", "🎉", "👍", "❤️", "🙌", "🎯"] },
  { label: "Symbols", emojis: ["✅", "❌", "⚠️", "📌", "🔍", "💬", "📝", "📊", "🔒", "🔑", "🌐", "🛠️"] },
];

export function TextEditor({ slug, token }: TextEditorProps) {
  const { content: serverContent, loading, touchLocalEdit } = usePageContent(slug);
  const [textVal, setTextVal] = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const [showToolbar, setShowToolbar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusEl = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const displayContent = textVal !== null ? textVal : (serverContent ?? "");

  const updateStatusUI = (status: SaveStatus) => {
    if (statusEl.current) {
      statusEl.current.setAttribute("data-status", status);
    }
  };

  const saveContent = useCallback(async (newText: string, authToken: string | null) => {
    touchLocalEdit();
    try {
      const res = await fetch(`/api/pages/${slug}`, {
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

  const handleClearText = () => {
    setTextVal("");
    scheduleSave("");
    showToast("Notes cleared", "info");
  };

  // Helper to insert Markdown syntax around selection or cursor
  const applyFormat = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = displayContent;

    const selectedText = current.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const nextContent = current.substring(0, start) + replacement + current.substring(end);

    setTextVal(nextContent);
    scheduleSave(nextContent);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 4);
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

  // Direct File Upload from Zoho Cliq Toolbar Paperclip
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
      // Notify file vault panel to refresh list
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("files_updated"));
      }
    } catch {
      showToast("Upload failed due to connection error", "error");
    } finally {
      setUploading(false);
    }
  };

  // AI Copilot Auto Format Assistant — Full Markdown Beautifier Engine
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

      // Detect code fences (```)
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        formattedLines.push(line.trimEnd());
        continue;
      }

      // Inside code blocks, preserve whitespace formatting & indentation
      if (inCodeBlock) {
        formattedLines.push(line.trimEnd());
        continue;
      }

      // Outside code blocks: apply full Markdown formatting
      let trimmed = line.trimEnd();

      // 1. Headings: ensure space after # (e.g. #Heading -> # Heading)
      trimmed = trimmed.replace(/^(#{1,6})([^#\s])/g, "$1 $2");

      // 2. Unordered lists: convert * or + to - and ensure space after hyphen
      trimmed = trimmed.replace(/^(\s*)[*+]\s+/g, "$1- ");
      trimmed = trimmed.replace(/^(\s*)-\s*([^\s\-[\]])/g, "$1- $2");

      // 3. Task lists: ensure space in - [ ] or - [x]
      trimmed = trimmed.replace(/^(\s*)-\s*\[([ xX])\]\s*([^\s])/g, "$1- [$2] $3");

      // 4. Ordered lists: ensure space after period (e.g. 1.item -> 1. item)
      trimmed = trimmed.replace(/^(\s*\d+\.)([^\s])/g, "$1 $2");

      // 5. Blockquotes: ensure space after > (e.g. >quote -> > quote)
      trimmed = trimmed.replace(/^(\s*>)([^\s>])/g, "$1 $2");

      // 6. Fix punctuation space after commas (excluding numbers/URLs)
      trimmed = trimmed.replace(/([a-zA-Z0-9_)]),(?=[a-zA-Z0-9_(])/g, "$1, ");

      formattedLines.push(trimmed);
    }

    // Combine lines and collapse 3+ consecutive blank lines down to 2
    const formattedText = formattedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    if (formattedText === displayContent) {
      showToast("Notes are already formatted cleanly!", "info");
      return;
    }

    setTextVal(formattedText);
    scheduleSave(formattedText);
    showToast("AI Copilot formatted your notes cleanly!", "success");
  };

  const wordCount = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0;
  const charCount = displayContent.length;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] transition-colors duration-200">
      {/* Hidden File Upload Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 gap-2 flex-wrap transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--text-main)] font-extrabold">
            <FileEdit size={16} className="text-[var(--accent-indigo)]" />
            <span className="text-xs uppercase tracking-wider hidden sm:inline">Notes Workspace</span>
          </div>

          <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">
            {wordCount} words · {charCount} chars
          </span>
        </div>

        {/* View Mode Mode Toggles & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-xs font-extrabold">
            <button
              onClick={() => setViewMode("write")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                viewMode === "write" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Edit View"
            >
              <Edit3 size={12} />
              <span className="hidden md:inline">Write</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
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
              title="Formatted Preview"
            >
              <Eye size={12} />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>

          <div ref={statusEl} data-status="idle" className="hidden sm:block">
            <div className="[div[data-status='saving']_&]:flex hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs font-bold text-[var(--badge-text)]">
              <Loader2 size={12} className="animate-spin" />
              <span>Syncing…</span>
            </div>
            <div className="[div[data-status='saved']_&]:flex hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-xs font-bold text-[var(--status-success-text)]">
              <CheckCircle2 size={12} />
              <span>Saved live</span>
            </div>
            <div className="[div[data-status='idle']_&]:flex hidden items-center gap-1.5 text-xs font-bold text-[var(--text-subtle)]">
              <Sparkles size={12} className="text-[var(--accent-indigo)]" />
              <span>Auto-sync</span>
            </div>
          </div>

          <div className="h-4 w-px bg-[var(--border-color)] mx-0.5" />

          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] transition-all shadow-sm cursor-pointer"
            title="Copy notes"
          >
            {copied ? <Check size={15} className="text-[var(--status-success-text)]" /> : <Copy size={15} />}
          </button>
          <button
            onClick={handleClearText}
            className="p-2 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] hover:opacity-80 transition-all shadow-sm cursor-pointer"
            title="Clear notes"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Zoho Cliq-Styled Composer Container */}
      <div className="flex-1 min-h-0 p-3 sm:p-5 flex flex-col relative overflow-hidden bg-[var(--bg-main)]">
        {loading ? (
          <div className="w-full space-y-4 animate-pulse p-4">
            {[85, 70, 92, 60, 78].map((w, i) => (
              <div key={i} className="skeleton h-5 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex gap-4 overflow-hidden">
            {/* Writer Pane */}
            {(viewMode === "write" || viewMode === "split") && (
              <div className="flex-1 h-full min-w-0 flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--border-glow)] transition-all shadow-lg overflow-hidden relative">

                {/* Zoho Cliq Top Inline Formatting Toolbar */}
                {showToolbar && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex-wrap select-none">
                    <button
                      onClick={() => applyFormat("**", "**")}
                      title="Bold (**text**)"
                      className="px-2 py-1 rounded-md text-xs font-serif font-black text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      onClick={() => applyFormat("*", "*")}
                      title="Italic (*text*)"
                      className="px-2 py-1 rounded-md text-xs font-serif italic font-bold text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      I
                    </button>
                    <button
                      onClick={() => applyFormat("<u>", "</u>")}
                      title="Underline (<u>text</u>)"
                      className="px-2 py-1 rounded-md text-xs font-serif underline font-bold text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      U
                    </button>
                    <button
                      onClick={() => applyFormat("~~", "~~")}
                      title="Strikethrough (~~text~~)"
                      className="px-2 py-1 rounded-md text-xs font-serif line-through font-bold text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      S
                    </button>

                    <div className="w-px h-3.5 bg-[var(--border-color)] mx-1" />

                    <button
                      onClick={() => applyFormat("> ")}
                      title="Quote (> quote)"
                      className="p-1 rounded-md text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Quote size={13} />
                    </button>

                    <button
                      onClick={() => applyFormat("[", "](https://)")}
                      title="Insert Hyperlink"
                      className="p-1 rounded-md text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Link size={13} />
                    </button>

                    <button
                      onClick={() => applyFormat("```\n", "\n```")}
                      title="Insert Code Block (```)"
                      className="p-1 rounded-md text-[var(--accent-indigo)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Code2 size={14} />
                    </button>

                    <div className="w-px h-3.5 bg-[var(--border-color)] mx-1" />

                    <button
                      onClick={() => setViewMode("preview")}
                      title="Toggle Markdown Preview"
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold text-[var(--accent-indigo)] bg-[var(--badge-bg)] border border-[var(--badge-border)] hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                  </div>
                )}

                {/* Zoho Cliq Canvas Area */}
                <textarea
                  ref={textareaRef}
                  value={displayContent}
                  onChange={handleChange}
                  placeholder="Type or paste notes here…"
                  className="w-full flex-1 resize-none bg-transparent text-[var(--text-main)] p-4 sm:p-5 outline-none font-mono text-sm leading-relaxed placeholder-[var(--text-subtle)]"
                />

                {/* Zoho Cliq Bottom Action Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface)] border-t border-[var(--border-color)] relative select-none">
                  {/* Left Side File & Media Tool Icons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      title="Attach File to Space Vault"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={15} className="animate-spin text-[var(--accent-indigo)]" /> : <Paperclip size={15} />}
                    </button>
                    <div className="w-px h-3 bg-[var(--border-color)]" />
                    <button
                      onClick={() => applyFormat("[🎙️ Audio Note](", ")")}
                      title="Voice / Audio Note format"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Mic size={15} />
                    </button>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      title="Attach Video file"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Video size={15} />
                    </button>
                    <button
                      onClick={() => applyFormat("```javascript\n// Code Snippet\n", "\n```")}
                      title="Insert Code Snippet"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Monitor size={15} />
                    </button>
                    <div className="w-px h-3 bg-[var(--border-color)]" />
                    <button
                      onClick={() => applyFormat("```\n", "\n```")}
                      title="Insert Code Block"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <FileCode size={15} />
                    </button>
                  </div>

                  {/* Right Side Options & Emoji Picker */}
                  <div className="flex items-center gap-2">
                    {/* Formatting Toggle Button Aa */}
                    <button
                      onClick={() => setShowToolbar(!showToolbar)}
                      title="Toggle Formatting Toolbar"
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        showToolbar
                          ? "bg-[var(--accent-primary)] text-white shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      <Type size={15} />
                    </button>

                    {/* Interactive Emoji Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Insert Emoji"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Smile size={16} />
                      </button>

                      {/* Emoji Popover */}
                      {showEmojiPicker && (
                        <div className="absolute right-0 bottom-10 z-50 w-64 p-3 bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-slide-up">
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

                    {/* AI Assistant Button */}
                    <button
                      onClick={handleAICopilotFormat}
                      className="w-7 h-7 rounded-xl bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-indigo)] shadow-sm hover:border-[var(--accent-indigo)] transition-all cursor-pointer"
                      title="AI Copilot Auto-Format Notes"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formatted Markdown Live Preview Pane */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="flex-1 h-full min-w-0 flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-lg">
                <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Eye size={13} className="text-[var(--accent-indigo)]" />
                  <span>Formatted Output</span>
                </div>
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
                  <MarkdownRenderer content={displayContent} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
