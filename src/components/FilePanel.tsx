"use client";
import { useCallback, useRef, useState } from "react";
import { UploadCloud, FolderOpen, FileUp } from "lucide-react";
import { useFileList } from "@/hooks/useFileList";
import { FileCard } from "@/components/FileCard";
import { showToast } from "@/components/ui/Toast";

interface FilePanelProps {
  slug:  string;
  token: string | null;
}

export function FilePanel({ slug, token }: FilePanelProps) {
  const { files, loading } = useFileList(slug);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      showToast(`File exceeds 50 MB limit: ${file.name}`, "error");
      return;
    }

    setUploading((u) => [...u, file.name]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/pages/${slug}/files/upload`, {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? `Upload failed for ${file.name}`, "error");
        return;
      }

      showToast(`${file.name} uploaded successfully`, "success");
    } catch {
      showToast("Connection error during file upload", "error");
    } finally {
      setUploading((u) => u.filter((n) => n !== file.name));
    }
  }, [slug, token]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave()                  { setDragging(false); }
  function onDrop(e: React.DragEvent)     { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] transition-colors duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-2 text-[var(--text-main)] font-extrabold">
          <FolderOpen size={16} className="text-[var(--accent-indigo)]" />
          <span className="text-xs uppercase tracking-wider">Shared Files Vault</span>
        </div>
        {files.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-[11px] font-extrabold">
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Drop zone container */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3
            rounded-2xl border-2 border-dashed p-6 sm:p-8 cursor-pointer
            transition-all duration-200 group
            ${dragging
              ? "border-[var(--accent-primary)] bg-[var(--badge-bg)] scale-[1.01] shadow-lg"
              : "border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] shadow-sm"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center
            transition-all duration-200 border
            ${dragging
              ? "bg-[var(--badge-bg)] border-[var(--accent-primary)]"
              : "bg-[var(--badge-bg)] border-[var(--badge-border)] group-hover:scale-105"
            }
          `}>
            <UploadCloud size={24} className="text-[var(--accent-indigo)]" />
          </div>
          <div className="text-center">
            <p className={`text-sm font-bold transition-colors ${dragging ? "text-[var(--accent-primary)]" : "text-[var(--text-main)]"}`}>
              {dragging ? "Drop files to upload instantly" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              or <span className="text-[var(--accent-indigo)] underline underline-offset-2 font-bold">browse files</span> · max 50 MB each
            </p>
          </div>
        </div>

        {/* Uploading Progress Items */}
        {uploading.map((name) => (
          <div key={name} className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glow)] animate-fade-in shadow-md">
            <div className="w-9 h-9 rounded-lg bg-[var(--badge-bg)] flex items-center justify-center shrink-0">
              <FileUp size={18} className="text-[var(--accent-indigo)] animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-[var(--text-main)] truncate">{name}</p>
              <div className="h-1.5 bg-black/10 dark:bg-black/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        ))}

        {/* Files List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : files.length === 0 && uploading.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]">
            <FolderOpen size={32} className="mx-auto text-[var(--text-subtle)] mb-2 opacity-60" />
            <p className="text-sm font-bold text-[var(--text-muted)]">No files in this space yet</p>
            <p className="text-xs text-[var(--text-subtle)] mt-1 font-medium">Upload documents, images, or audio above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {files.map((f) => (
              <FileCard key={f.fileId} file={f} slug={slug} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
