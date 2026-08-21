"use client";
import { useCallback, useRef, useState } from "react";
import { UploadCloud, FolderOpen, FileUp, Search, LayoutGrid, LayoutList, X } from "lucide-react";
import { useFileList, FileItem } from "@/hooks/useFileList";
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

type FileCategory = "all" | "images" | "docs" | "code" | "media";

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

function matchCategory(file: FileItem, cat: FileCategory): boolean {
  if (cat === "all") return true;
  const mime = file.mimetype.toLowerCase();
  const ext = (file.originalName.includes(".") ? file.originalName.split(".").pop() : "")?.toLowerCase() || "";

  if (cat === "images") {
    return mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp"].includes(ext);
  }
  if (cat === "media") {
    return mime.startsWith("audio/") || mime.startsWith("video/") || ["mp3", "wav", "ogg", "flac", "mp4", "webm", "mkv", "avi", "mov"].includes(ext);
  }
  if (cat === "docs") {
    return (
      mime === "application/pdf" ||
      mime.includes("document") ||
      mime.includes("word") ||
      mime.includes("spreadsheet") ||
      mime.includes("presentation") ||
      ["pdf", "doc", "docx", "txt", "rtf", "odt", "xls", "xlsx", "csv", "ppt", "pptx"].includes(ext)
    );
  }
  if (cat === "code") {
    return (
      mime.startsWith("text/") ||
      mime.includes("json") ||
      mime.includes("javascript") ||
      mime.includes("typescript") ||
      mime.includes("xml") ||
      ["js", "ts", "tsx", "jsx", "py", "html", "css", "json", "sh", "c", "cpp", "go", "rs", "java", "php", "sql", "md", "yaml", "yml"].includes(ext)
    );
  }
  return true;
}

export function FilePanel({ slug, token }: FilePanelProps) {
  const { files, loading } = useFileList(slug);
  const [dragging,       setDragging]       = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCategory, setActiveCategory] = useState<FileCategory>("all");
  const [viewLayout,     setViewLayout]     = useState<"list" | "grid">("list");
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
      // Error handled
    }
  }, [slug, token]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave()                  { setDragging(false); }
  function onDrop(e: React.DragEvent)     { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = matchCategory(f, activeCategory);
    return matchesSearch && matchesCat;
  });

  const categories: { id: FileCategory; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "images", label: "Images" },
    { id: "docs",   label: "Docs" },
    { id: "code",   label: "Code" },
    { id: "media",  label: "Media" },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] transition-colors duration-200 select-none">
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        aria-label="Upload files to space vault"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0 transition-colors duration-200 gap-2">
        <div className="flex items-center gap-1.5 text-[var(--text-main)] font-extrabold shrink-0">
          <FolderOpen size={15} className="text-[var(--accent-indigo)]" />
          <span className="text-[11px] uppercase tracking-wider font-mono">Explorer</span>
          {files.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-[10px] font-extrabold ml-1">
              {files.length}
            </span>
          )}
        </div>

        {/* View Layout Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewLayout("list")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === "list" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="List View"
            >
              <LayoutList size={13} />
            </button>
            <button
              onClick={() => setViewLayout("grid")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === "grid" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      {files.length > 0 && (
        <div className="px-2.5 pt-2 pb-1 shrink-0 space-y-1.5 border-b border-[var(--border-color)]/40">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[var(--text-subtle)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files…"
              className="w-full pl-8 pr-7 py-1.5 bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] rounded-lg text-xs font-mono text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition-all font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap border
                  ${activeCategory === cat.id
                    ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm"
                    : "bg-[var(--badge-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-color)]"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-0">
        {/* Drop zone container */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex items-center justify-between gap-3
            rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group
            ${files.length > 0 ? "px-3 py-2" : "flex-col p-5 text-center"}
            ${dragging
              ? "border-[var(--accent-primary)] bg-[var(--badge-bg)] scale-[1.01] shadow-lg"
              : "border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] shadow-sm"
            }
          `}
        >
          {files.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[var(--badge-bg)] text-[var(--accent-indigo)]">
                  <UploadCloud size={15} />
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">
                  {dragging ? "Drop files to upload" : "Upload new file"}
                </span>
              </div>
              <span className="text-[10px] text-[var(--accent-indigo)] font-bold underline underline-offset-2">
                Browse
              </span>
            </>
          ) : (
            <>
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-200 border
                ${dragging
                  ? "bg-[var(--badge-bg)] border-[var(--accent-primary)]"
                  : "bg-[var(--badge-bg)] border-[var(--badge-border)] group-hover:scale-105"
                }
              `}>
                <UploadCloud size={20} className="text-[var(--accent-indigo)]" />
              </div>
              <div>
                <p className={`text-xs font-bold transition-colors ${dragging ? "text-[var(--accent-primary)]" : "text-[var(--text-main)]"}`}>
                  {dragging ? "Drop files" : "Drag & drop files here"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">
                  or <span className="text-[var(--accent-indigo)] underline underline-offset-2 font-bold">browse files</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Real-time Upload Progress Items */}
        {Object.values(uploadProgress).map((item) => (
          <div key={item.id} className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-primary)] animate-fade-in shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileUp size={15} className="text-[var(--accent-primary)] animate-bounce shrink-0" />
                <span className="text-xs font-bold text-[var(--text-main)] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-[var(--accent-primary)] shrink-0">
                {item.percent}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-200"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>{item.loadedFormatted} / {item.totalFormatted}</span>
              <span className="font-bold text-[var(--accent-primary)]">{item.speedFormatted}</span>
            </div>
          </div>
        ))}

        {/* Files Display (List vs Grid) */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredFiles.length === 0 && Object.keys(uploadProgress).length === 0 ? (
          <div className="text-center py-8 px-3 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-card)]">
            <FolderOpen size={24} className="mx-auto text-[var(--text-subtle)] mb-2 opacity-60" />
            <p className="text-xs font-bold text-[var(--text-muted)]">
              {searchQuery || activeCategory !== "all"
                ? "No matching files"
                : "No files yet"}
            </p>
            <p className="text-[10px] text-[var(--text-subtle)] mt-1 font-medium">
              {searchQuery || activeCategory !== "all"
                ? "Try clearing filters or search term"
                : "Upload docs, images, or audio"}
            </p>
          </div>
        ) : (
          <div className={viewLayout === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"}>
            {filteredFiles.map((f) => (
              <FileCard key={f.fileId} file={f} slug={slug} token={token} layout={viewLayout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
