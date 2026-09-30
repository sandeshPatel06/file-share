import JSZip from "jszip";
import { showToast } from "@/components/ui/Toast";

interface FileEntry {
  originalName: string;
  downloadURL: string;
  size: number;
}

export async function exportAllAsZip(options: {
  slug: string;
  content: string;
  token?: string | null;
  onProgress?: (status: string) => void;
}) {
  const { slug, content, token, onProgress } = options;
  const zip = new JSZip();

  try {
    if (onProgress) onProgress("Preparing workspace notes…");

    // 1. Add current markdown content
    zip.file(`${slug}-notes.md`, content || "");

    // 2. Add README metadata & retention notice
    const readmeContent = `=====================================================
FileShare Workspace Export: /s/${slug}
Exported on: ${new Date().toISOString()}
=====================================================

Contents:
- ${slug}-notes.md: Raw Markdown notes and editor content
- files/: All attached documents, images, and media

DATA RETENTION NOTICE:
FileShare is a zero-registration, privacy-first service.
Inactive workspaces and attached files may be pruned after
30 days of inactivity. This export contains your offline backup.

Website: https://fileshare.shptechnology.online
=====================================================
`;
    zip.file("README.txt", readmeContent);

    // 3. Fetch file list
    if (onProgress) onProgress("Discovering attached files…");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`/api/pages/${slug}/files`, { headers });
    if (res.ok) {
      const files: FileEntry[] = await res.json();
      if (Array.isArray(files) && files.length > 0) {
        const filesFolder = zip.folder("files");
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          if (onProgress) onProgress(`Archiving (${i + 1}/${files.length}): ${f.originalName}`);
          try {
            const fileRes = await fetch(f.downloadURL, { headers });
            if (fileRes.ok) {
              const blob = await fileRes.blob();
              filesFolder?.file(f.originalName, blob);
            }
          } catch (err) {
            console.warn(`Failed to package ${f.originalName}:`, err);
          }
        }
      }
    }

    if (onProgress) onProgress("Compressing ZIP archive…");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${slug}-full-export.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

    showToast("Full workspace ZIP archive downloaded!", "success");
  } catch (err) {
    console.error("ZIP export failed:", err);
    showToast("Failed to generate ZIP export", "error");
  } finally {
    if (onProgress) onProgress("");
  }
}

export async function exportFilesOnlyAsZip(options: {
  slug: string;
  files: { originalName: string; downloadURL: string }[];
  token?: string | null;
  onProgress?: (status: string) => void;
}) {
  const { slug, files, token, onProgress } = options;
  if (!files || files.length === 0) {
    showToast("No files to download", "info");
    return;
  }

  const zip = new JSZip();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (onProgress) onProgress(`Downloading (${i + 1}/${files.length}): ${f.originalName}`);
      try {
        const res = await fetch(f.downloadURL, { headers });
        if (res.ok) {
          const blob = await res.blob();
          zip.file(f.originalName, blob);
        }
      } catch (err) {
        console.warn(`Failed to package ${f.originalName}:`, err);
      }
    }

    if (onProgress) onProgress("Generating ZIP…");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${slug}-files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

    showToast(`Downloaded ${files.length} files as ZIP!`, "success");
  } catch (err) {
    console.error("ZIP download failed:", err);
    showToast("Failed to download files as ZIP", "error");
  } finally {
    if (onProgress) onProgress("");
  }
}
