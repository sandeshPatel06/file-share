"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileItem } from "@/hooks/useFileList";
import { Download, ExternalLink, FileText, FileCode, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewModalProps {
  file:    FileItem | null;
  open:    boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, open, onClose }: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

  const isImage = file?.mimetype.startsWith("image/");
  const isVideo = file?.mimetype.startsWith("video/");
  const isAudio = file?.mimetype.startsWith("audio/");
  const isPDF   = file?.mimetype === "application/pdf";

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
    if (!open || !file || !isTextLike) {
      return;
    }

    let active = true;

    const loadPreviewText = async () => {
      setLoadingText(true);
      try {
        const res = await fetch(file.downloadURL);
        const text = await res.text();
        if (active) setTextContent(text);
      } catch {
        if (active) setTextContent("Failed to load text content preview.");
      } finally {
        if (active) setLoadingText(false);
      }
    };

    loadPreviewText();

    return () => {
      active = false;
    };
  }, [open, file, isTextLike]);

  if (!file) return null;

  return (
    <Modal open={open} onClose={onClose} title={file.originalName} maxWidth="max-w-3xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-full min-h-[260px] max-h-[500px] rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden p-2 relative">
          {isImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={file.downloadURL}
              alt={file.originalName}
              className="max-h-[460px] w-auto max-w-full object-contain rounded-xl shadow-lg"
            />
          ) : isVideo ? (
            <video
              src={file.downloadURL}
              controls
              autoPlay={false}
              className="max-h-[460px] w-full rounded-xl"
            />
          ) : isAudio ? (
            <div className="w-full p-8 flex flex-col items-center justify-center gap-4 bg-[var(--bg-card)] rounded-xl">
              <div className="w-16 h-16 rounded-2xl bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-indigo)] mb-2 animate-pulse">
                <FileCode size={32} />
              </div>
              <p className="text-sm font-semibold text-[var(--text-main)] font-mono">{file.originalName}</p>
              <audio src={file.downloadURL} controls className="w-full max-w-md" />
            </div>
          ) : isPDF ? (
            <iframe
              src={file.downloadURL}
              title={file.originalName}
              className="w-full h-[450px] rounded-xl border-none"
            />
          ) : isTextLike ? (
            <div className="w-full h-[450px] overflow-auto p-4 font-mono text-xs text-[var(--text-main)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] leading-relaxed select-text">
              {loadingText ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                  <Loader2 size={24} className="animate-spin text-[var(--accent-indigo)]" />
                  <span>Loading text preview…</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
              )}
            </div>
          ) : (
            <div className="text-center p-10 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-indigo)] mb-4 shadow-inner">
                <FileText size={40} />
              </div>
              <p className="text-base font-bold text-[var(--text-main)]">{file.originalName}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
                {file.mimetype || "Unknown File Type"}
              </p>
              <p className="text-xs text-[var(--text-subtle)] mt-3 max-w-sm">
                Direct browser preview is unavailable for this binary format. Click below to download or view natively.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full pt-3 border-t border-[var(--border-color)]">
          <a href={file.downloadURL} download={file.originalName} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="primary" icon={<Download size={14} />} className="w-full">
              Download File
            </Button>
          </a>
          <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink size={14} />}>
              Open Original
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
