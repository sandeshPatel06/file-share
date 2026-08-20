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

interface UploadProgressItem {
  id: string;
  name: string;
  percent: number;
  loadedFormatted: string;
  totalFormatted: string;
  speedFormatted: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return "0 KB/s";
  if (bytesPerSec >= 1024 * 1024) {
    return (bytesPerSec / (1024 * 1024)).toFixed(1) + " MB/s";
  }
  return Math.round(bytesPerSec / 1024) + " KB/s";
}

export function FilePanel({ slug, token }: FilePanelProps) {
  const { files, loading } = useFileList(slug);
  const [dragging,  setDragging]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgressItem>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      showToast(`File exceeds 500 MB limit: ${file.name}`, "error");
      return;
    }

    const uploadId = `${file.name}-${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    setUploadProgress((prev) => ({
      ...prev,
      [uploadId]: {
        id: uploadId,
        name: file.name,
        percent: 0,
        loadedFormatted: "0 Bytes",
        totalFormatted: formatBytes(file.size),
        speedFormatted: "Starting...",
      },
    }));

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
            const elapsed = (Date.now() - startTime) / 1000 || 0.1;
            const speedBytesSec = e.loaded / elapsed;

            setUploadProgress((prev) => ({
              ...prev,
              [uploadId]: {
                id: uploadId,
                name: file.name,
                percent,
                loadedFormatted: formatBytes(e.loaded),
                totalFormatted: formatBytes(e.total),
                speedFormatted: formatSpeed(speedBytesSec),
              },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress((prev) => ({
              ...prev,
              [uploadId]: {
                id: uploadId,
                name: file.name,
                percent: 100,
                loadedFormatted: formatBytes(file.size),
                totalFormatted: formatBytes(file.size),
                speedFormatted: "Done",
              },
            }));
            showToast(`${file.name} uploaded successfully`, "success");
            setTimeout(() => {
              setUploadProgress((prev) => {
                const next = { ...prev };
                delete next[uploadId];
                return next;
              });
            }, 1000);
            resolve();
          } else {
            let errorMsg = `Upload failed for ${file.name}`;
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.error) errorMsg = res.error;
            } catch {}
            showToast(errorMsg, "error");
            setUploadProgress((prev) => {
              const next = { ...prev };
              delete next[uploadId];
              return next;
            });
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          showToast(`Connection error during upload of ${file.name}`, "error");
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[uploadId];
            return next;
          });
          reject(new Error("Connection error"));
        };

        xhr.open("POST", `/api/pages/${slug}/files/upload`, true);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    } catch {
      // Error handles toast
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
            aria-label="Upload files to space vault"
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
              or <span className="text-[var(--accent-indigo)] underline underline-offset-2 font-bold">browse files</span> · max 500 MB each
            </p>
          </div>
        </div>

        {/* Real-time Upload Progress Items */}
        {Object.values(uploadProgress).map((item) => (
          <div key={item.id} className="flex flex-col gap-2 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-primary)] animate-fade-in shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileUp size={16} className="text-[var(--accent-primary)] animate-bounce shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-[var(--accent-primary)] shrink-0">
                {item.percent}%
              </span>
            </div>

            {/* Real-time Progress Bar */}
            <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-200"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            {/* Upload Speed & Byte Stats */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>{item.loadedFormatted} / {item.totalFormatted}</span>
              <span className="font-bold text-[var(--accent-primary)]">{item.speedFormatted}</span>
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
        ) : files.length === 0 && Object.keys(uploadProgress).length === 0 ? (
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
