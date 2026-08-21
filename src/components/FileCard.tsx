"use client";
import { FileItem } from "@/hooks/useFileList";
import { Download, Trash2, File, FileText, Image as ImageIcon, FileArchive, FileAudio, FileVideo, Eye, Copy, Check, FileSpreadsheet, Presentation, FileCode } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { useState } from "react";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { copyToClipboard } from "@/lib/clipboard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface FileCardProps {
  file:   FileItem;
  slug:   string;
  token:  string | null;
  layout?: "list" | "grid";
}

function FileIcon({ filename, mimetype, size = 18 }: { filename: string; mimetype: string; size?: number }) {
  const cls = "shrink-0";
  const ext = (filename.includes(".") ? (filename.split(".").pop() || "") : "").toUpperCase();

  if (mimetype.startsWith("image/") || ["JPG", "JPEG", "PNG", "GIF", "WEBP", "SVG", "ICO", "BMP", "TIFF"].includes(ext)) {
    return <ImageIcon size={size} className={`${cls} text-[var(--accent-sky)]`} />;
  }
  if (mimetype.startsWith("audio/") || ["MP3", "WAV", "OGG", "FLAC", "AAC", "M4A", "WMA"].includes(ext)) {
    return <FileAudio size={size} className={`${cls} text-purple-500 dark:text-purple-400`} />;
  }
  if (mimetype.startsWith("video/") || ["MP4", "WEBM", "MKV", "AVI", "MOV", "WMV", "FLV"].includes(ext)) {
    return <FileVideo size={size} className={`${cls} text-[var(--status-danger-text)]`} />;
  }
  if (mimetype === "application/pdf" || ext === "PDF") {
    return <FileText size={size} className={`${cls} text-amber-500`} />;
  }
  if (["XLS", "XLSX", "CSV", "TSV", "ODS"].includes(ext) || mimetype.includes("spreadsheet") || mimetype.includes("excel") || mimetype === "text/csv") {
    return <FileSpreadsheet size={size} className={`${cls} text-emerald-500`} />;
  }
  if (["PPT", "PPTX", "KEY", "ODP"].includes(ext) || mimetype.includes("presentation") || mimetype.includes("powerpoint")) {
    return <Presentation size={size} className={`${cls} text-orange-500`} />;
  }
  if (["DOC", "DOCX", "ODT", "RTF"].includes(ext) || mimetype.includes("wordprocessingml") || mimetype.includes("msword")) {
    return <FileText size={size} className={`${cls} text-blue-500`} />;
  }
  if (["ZIP", "RAR", "7Z", "TAR", "GZ", "BZ2", "XZ"].includes(ext) || mimetype.includes("zip") || mimetype.includes("compressed") || mimetype.includes("archive")) {
    return <FileArchive size={size} className={`${cls} text-purple-400`} />;
  }
  if (
    mimetype.startsWith("text/") ||
    mimetype.includes("json") ||
    mimetype.includes("javascript") ||
    ["JS", "TS", "TSX", "JSX", "PY", "HTML", "CSS", "JSON", "SH", "C", "CPP", "GO", "RS", "JAVA", "PHP", "RB", "SQL", "MD", "XML", "YAML", "YML"].includes(ext)
  ) {
    return <FileCode size={size} className={`${cls} text-[var(--accent-indigo)]`} />;
  }

  if (ext) {
    return (
      <span className="font-mono text-[10px] font-extrabold text-[var(--accent-indigo)] tracking-tighter uppercase select-none">
        {ext.slice(0, 3)}
      </span>
    );
  }

  return <File size={size} className={`${cls} text-[var(--text-muted)]`} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 15)    return "just now";
  if (diff < 60)   return `${Math.max(1, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatUserLocalDateTime(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FileCard({ file, slug, token, layout = "list" }: FileCardProps) {
  const [deleting,          setDeleting]          = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview,       setShowPreview]       = useState(false);
  const [copiedUrl,         setCopiedUrl]         = useState(false);
  const [imgError,          setImgError]          = useState(false);

  const isImage = file.mimetype.startsWith("image/");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const rawPath = file.downloadURL.startsWith("http") ? file.downloadURL : `${origin}${file.downloadURL}`;
  const fullDownloadUrl = token && !rawPath.includes("token=")
    ? `${rawPath}${rawPath.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : rawPath;

  const previewUrl = token && !file.downloadURL.includes("token=")
    ? `${file.downloadURL}${file.downloadURL.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : file.downloadURL;

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${slug}/files/${file.fileId}`, {
        method:  "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) { showToast("Failed to delete file", "error"); return; }
      showToast("File deleted", "info");
    } catch { showToast("Connection error", "error"); }
    finally { setDeleting(false); setShowConfirmDelete(false); }
  }

  async function handleCopyUrl() {
    const ok = await copyToClipboard(fullDownloadUrl);
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
      {layout === "grid" ? (
        /* Grid Layout Card */
        <div className="
          group flex flex-col justify-between p-2.5 rounded-xl
          bg-[var(--bg-card)] border border-[var(--border-color)]
          hover:border-[var(--accent-primary)] hover:shadow-md
          transition-all duration-200 animate-fade-in min-w-0 h-full select-none
        ">
          {/* Top Thumbnail / Preview Box */}
          <div
            onClick={() => setShowPreview(true)}
            className="w-full h-24 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/40 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer transition-all relative"
          >
            {isImage && !imgError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt={file.originalName}
                onError={() => setImgError(true)}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <FileIcon filename={file.originalName} mimetype={file.mimetype} size={28} />
            )}
          </div>

          {/* Middle File Info */}
          <div className="mt-2 min-w-0 cursor-pointer" onClick={() => setShowPreview(true)}>
            <p className="text-xs font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent-indigo)] transition-colors">
              {file.originalName}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono truncate font-semibold">
              {formatBytes(file.size)}
              {file.uploadedAt && <span> · {timeAgo(file.uploadedAt.seconds)}</span>}
            </p>
          </div>

          {/* Bottom Grid Actions */}
          <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-[var(--border-color)] shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPreview(true)}
                title="Preview"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Eye size={13} />
              </button>
              <button
                onClick={handleCopyUrl}
                title="Copy link"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copiedUrl ? <Check size={13} className="text-[var(--status-success-text)]" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <a href={fullDownloadUrl} download={file.originalName} target="_blank" rel="noopener noreferrer">
                <button
                  title="Download"
                  className="p-1.5 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all cursor-pointer"
                >
                  <Download size={13} />
                </button>
              </a>
              <button
                onClick={() => setShowConfirmDelete(true)}
                title="Delete"
                className="p-1.5 rounded-lg text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* List Layout Item (Default) */
        <div className="
          group flex items-center justify-between gap-2.5 p-2.5 rounded-xl
          bg-[var(--bg-card)] border border-[var(--border-color)]
          hover:border-[var(--border-glow)] hover:shadow-md
          transition-all duration-200 animate-fade-in min-w-0
        ">
          {/* Left Side: Thumbnail / Icon & Metadata */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => setShowPreview(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] hover:border-[var(--accent-primary)] flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 cursor-pointer overflow-hidden"
              title="Click to preview file"
            >
              {isImage && !imgError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt={file.originalName}
                  onError={() => setImgError(true)}
                  decoding="async"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FileIcon filename={file.originalName} mimetype={file.mimetype} />
              )}
            </button>

            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setShowPreview(true)}>
              <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent-indigo)] transition-colors">
                {file.originalName}
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-0.5 font-mono whitespace-nowrap truncate font-semibold">
                {formatBytes(file.size)}
                {file.uploadedAt && (
                  <span className="text-[var(--text-subtle)]" title={formatUserLocalDateTime(file.uploadedAt.seconds)}>
                    {" · "}{timeAgo(file.uploadedAt.seconds)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Side: Action controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowPreview(true)}
              title="Preview file"
              className="p-1.5 rounded-lg bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] transition-all shadow-sm cursor-pointer"
            >
              <Eye size={13} />
            </button>

            <button
              onClick={handleCopyUrl}
              title="Copy download link"
              className={`
                p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer
                ${copiedUrl
                  ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]"
                  : "bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)]"
                }
              `}
            >
              {copiedUrl ? <Check size={13} className="text-[var(--status-success-text)]" /> : <Copy size={13} />}
            </button>

            <a href={fullDownloadUrl} download={file.originalName} target="_blank" rel="noopener noreferrer">
              <button
                title="Download file"
                className="p-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white transition-all shadow-sm border border-[var(--border-glow)] flex items-center justify-center cursor-pointer"
              >
                <Download size={13} />
              </button>
            </a>

            <button
              onClick={() => setShowConfirmDelete(true)}
              title="Delete file"
              className="p-1.5 rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] hover:opacity-80 transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}

      <FilePreviewModal
        file={file}
        token={token}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />

      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete File?"
        description={`Are you sure you want to permanently delete "${file.originalName}"?`}
        confirmText="Delete File"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
