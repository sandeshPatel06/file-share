"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileItem } from "@/hooks/useFileList";
import { Download, ExternalLink, FileText, FileCode, Loader2, Copy, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/clipboard";

interface FilePreviewModalProps {
  file:    FileItem | null;
  token?:  string | null;
  open:    boolean;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewModal({ file, token, open, onClose }: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [copied, setCopied]           = useState(false);

  const isImage = file?.mimetype.startsWith("image/");
  const isVideo = file?.mimetype.startsWith("video/");
  const isAudio = file?.mimetype.startsWith("audio/");
  const isPDF   = file?.mimetype === "application/pdf" || file?.originalName.toLowerCase().endsWith(".pdf");

  const previewUrl = file ? (token ? `${file.downloadURL}?token=${encodeURIComponent(token)}` : file.downloadURL) : "";

  const isTextLike = file && (
    file.mimetype.startsWith("text/") ||
    file.mimetype.includes("json") ||
    file.mimetype.includes("javascript") ||
    file.mimetype.includes("typescript") ||
    file.mimetype.includes("xml") ||
    file.mimetype.includes("csv") ||
    file.mimetype.includes("markdown") ||
    file.originalName.endsWith(".txt") ||
    file.originalName.endsWith(".md") ||
    file.originalName.endsWith(".json") ||
    file.originalName.endsWith(".csv") ||
    file.originalName.endsWith(".js") ||
    file.originalName.endsWith(".ts") ||
    file.originalName.endsWith(".tsx") ||
    file.originalName.endsWith(".jsx") ||
    file.originalName.endsWith(".html") ||
    file.originalName.endsWith(".css") ||
    file.originalName.endsWith(".py") ||
    file.originalName.endsWith(".sh") ||
    file.originalName.endsWith(".log")
  );

  useEffect(() => {
    if (!open || !file || !isTextLike) return;

    let active = true;

    const loadPreviewText = async () => {
      setLoadingText(true);
      try {
        const res = await fetch(previewUrl);
        const text = await res.text();
        if (active) setTextContent(text);
      } catch {
        if (active) setTextContent("Failed to load text preview.");
      } finally {
        if (active) setLoadingText(false);
      }
    };

    loadPreviewText();

    return () => {
      active = false;
    };
  }, [open, file, isTextLike, previewUrl]);

  async function handleCopyLink() {
    if (!file) return;
    const fullUrl = `${window.location.origin}${previewUrl}`;
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopied(true);
      showToast("Direct file link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Failed to copy link", "error");
    }
  }

  if (!open || !file) return null;

  return (
    <Modal open={open} onClose={onClose} title={file.originalName} maxWidth="max-w-xl">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Preview Container */}
        <div className="w-full min-h-[220px] max-h-[450px] rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden p-4 relative shadow-sm">
          {isImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt={file.originalName}
              className="max-h-[400px] w-auto max-w-full object-contain rounded-xl shadow-md"
            />
          ) : isVideo ? (
            <video
              src={previewUrl}
              controls
              autoPlay={false}
              className="max-h-[400px] w-full rounded-xl"
            />
          ) : isAudio ? (
            <div className="w-full p-6 flex flex-col items-center justify-center gap-4 bg-[var(--bg-card)] rounded-xl">
              <div className="w-16 h-16 rounded-2xl bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-indigo)] animate-pulse">
                <FileCode size={32} />
              </div>
              <p className="text-sm font-bold text-[var(--text-main)] font-mono">{file.originalName}</p>
              <audio src={previewUrl} controls className="w-full max-w-md" />
            </div>
          ) : isPDF ? (
            <div className="w-full p-6 sm:p-8 flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
                <FileText size={36} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-main)] max-w-md truncate">{file.originalName}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-1 font-semibold">
                  PDF Document · {formatBytes(file.size)}
                </p>
              </div>
              <div className="w-full flex items-center justify-center gap-2 mt-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-xs">
                  <Button variant="primary" icon={<ExternalLink size={14} />} className="w-full text-xs font-extrabold">
                    Open PDF Document
                  </Button>
                </a>
              </div>
            </div>
          ) : isTextLike ? (
            <div className="w-full h-[350px] overflow-auto p-4 font-mono text-xs text-[var(--text-main)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] text-left leading-relaxed select-text">
              {loadingText ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                  <Loader2 size={24} className="animate-spin text-[var(--accent-indigo)]" />
                  <span>Loading text content…</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
              )}
            </div>
          ) : (
            <div className="text-center p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-indigo)] mb-3 shadow-inner">
                <FileText size={32} />
              </div>
              <p className="text-sm font-bold text-[var(--text-main)]">{file.originalName}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
                {file.mimetype || "Binary File"} · {formatBytes(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Link Copy Input Bar */}
        <div className="w-full flex items-center bg-[var(--input-bg)] border border-[var(--border-color)] rounded-2xl p-1.5">
          <input
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}${previewUrl}`}
            className="flex-1 px-3 py-1.5 text-xs text-[var(--text-main)] bg-transparent outline-none font-mono truncate select-all font-bold"
          />
          <Button size="sm" variant={copied ? "success" : "secondary"} icon={copied ? <CheckCheck size={13} /> : <Copy size={13} />} onClick={handleCopyLink}>
            {copied ? "Copied" : "Copy Direct Link"}
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full pt-2 border-t border-[var(--border-color)]">
          <a href={previewUrl} download={file.originalName} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="primary" icon={<Download size={14} />} className="w-full font-extrabold">
              Download File
            </Button>
          </a>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink size={14} />}>
              Open in New Tab
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
