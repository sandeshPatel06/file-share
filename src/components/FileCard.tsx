"use client";
import { FileItem } from "@/hooks/useFileList";
import { Download, Trash2, File, FileText, Image, FileArchive, FileAudio, FileVideo, Code2, Eye, Copy, Check } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { useState } from "react";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { copyToClipboard } from "@/lib/clipboard";

interface FileCardProps {
  file:  FileItem;
  slug:  string;
  token: string | null;
}

function FileIcon({ mimetype }: { mimetype: string }) {
  const cls = "shrink-0";
  if (mimetype.startsWith("image/"))  return <Image     size={18} className={`${cls} text-[var(--accent-sky)]`} />;
  if (mimetype.startsWith("audio/"))  return <FileAudio size={18} className={`${cls} text-purple-500 dark:text-purple-400`} />;
  if (mimetype.startsWith("video/"))  return <FileVideo size={18} className={`${cls} text-[var(--status-danger-text)]`} />;
  if (mimetype === "application/pdf") return <FileText  size={18} className={`${cls} text-amber-600 dark:text-amber-400`} />;
  if (mimetype.includes("zip") || mimetype.includes("rar") || mimetype.includes("tar")) return <FileArchive size={18} className={`${cls} text-[var(--status-success-text)]`} />;
  if (mimetype.startsWith("text/") || mimetype === "application/json" || mimetype.includes("javascript")) return <Code2 size={18} className={`${cls} text-[var(--accent-indigo)]`} />;
  return <File size={18} className={`${cls} text-[var(--text-muted)]`} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function FileCard({ file, slug, token }: FileCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  async function handleDelete() {
    if (!confirmDel) {
      setConfirmDel(true);
      setTimeout(() => setConfirmDel(false), 3500);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${slug}/files/${file.fileId}`, {
        method:  "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) { showToast("Failed to delete file", "error"); return; }
      showToast("File deleted", "info");
    } catch { showToast("Connection error", "error"); }
    finally { setDeleting(false); setConfirmDel(false); }
  }

  async function handleCopyUrl() {
    const ok = await copyToClipboard(file.downloadURL);
    if (ok) {
      setCopiedUrl(true);
      showToast("Direct file download link copied!", "success");
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      showToast("Failed to copy link", "error");
    }
  }

  return (
    <>
      <div className="
        group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl
        bg-[var(--bg-card)] border border-[var(--border-color)]
        hover:border-[var(--border-glow)] hover:shadow-md
        transition-all duration-200 animate-fade-in min-w-0
      ">
        {/* Left Side: Icon & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* File icon badge (Click to preview) */}
          <button
            onClick={() => setShowPreview(true)}
            className="w-9 h-9 rounded-xl bg-[var(--badge-bg)] border border-[var(--badge-border)] hover:border-[var(--accent-primary)] flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 cursor-pointer"
            title="Click to preview file"
          >
            <FileIcon mimetype={file.mimetype} />
          </button>

          {/* File name and single-line metadata */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setShowPreview(true)}>
            <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent-indigo)] transition-colors">
              {file.originalName}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono whitespace-nowrap truncate font-semibold">
              {formatBytes(file.size)}
              {file.uploadedAt && (
                <span className="text-[var(--text-subtle)]"> · {timeAgo(file.uploadedAt.seconds)}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Action controls (Icon buttons to fit comfortably) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowPreview(true)}
            title="Preview file"
            className="p-2 rounded-xl bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] transition-all shadow-sm cursor-pointer"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={handleCopyUrl}
            title="Copy download link"
            className={`
              p-2 rounded-xl border transition-all shadow-sm cursor-pointer
              ${copiedUrl
                ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]"
                : "bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)]"
              }
            `}
          >
            {copiedUrl ? <Check size={14} className="text-[var(--status-success-text)]" /> : <Copy size={14} />}
          </button>

          <a href={file.downloadURL} download={file.originalName} target="_blank" rel="noopener noreferrer">
            <button
              title="Download file"
              className="p-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white transition-all shadow-sm border border-[var(--border-glow)] flex items-center justify-center cursor-pointer"
            >
              <Download size={14} />
            </button>
          </a>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDel ? "Click again to confirm delete" : "Delete file"}
            className={`
              p-2 rounded-xl transition-all shadow-sm font-bold text-xs flex items-center gap-1 border cursor-pointer
              ${confirmDel
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)] hover:opacity-80"
              }
            `}
          >
            <Trash2 size={14} />
            {confirmDel ? "Confirm?" : ""}
          </button>
        </div>
      </div>

      <FilePreviewModal
        file={file}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
