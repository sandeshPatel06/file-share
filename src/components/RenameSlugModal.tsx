"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useRef } from "react";
import { showToast } from "@/components/ui/Toast";
import { slugSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, Check, Trash2, Clock } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRecentSpaces } from "@/hooks/useRecentSpaces";

interface RenameSlugModalProps {
  open:    boolean;
  onClose: () => void;
  slug:    string;
  token:   string | null;
}

export function RenameSlugModal({ open, onClose, slug, token }: RenameSlugModalProps) {
  const [newSlug,   setNewSlug]   = useState(slug);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking,  setChecking]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [slugError, setSlugError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { removeRecentSpace } = useRecentSpaces();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to delete workspace", "error");
        return;
      }
      removeRecentSpace(slug);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`token:${slug}`);
        sessionStorage.removeItem(`token:${slug}`);
      }
      showToast("Workspace deleted permanently", "success");
      onClose();
      router.push("/");
    } catch {
      showToast("Connection error while deleting", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleSlugChange(val: string) {
    setNewSlug(val);
    setAvailable(null);
    setSlugError("");

    const parsed = slugSchema.safeParse(val);
    if (!parsed.success) {
      setSlugError(parsed.error.issues[0]?.message ?? "Invalid slug format");
      return;
    }
    if (val === slug) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pages/create?slug=${encodeURIComponent(val)}`);
        const data = await res.json();
        setAvailable(data.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 350);
  }

  async function handleSave() {
    if (slugError || !newSlug || newSlug === slug) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${slug}/rename`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to rename workspace", "error");
        return;
      }

      if (data.redirected) {
        showToast(`Opening existing space /s/${data.newSlug}…`, "info");
      } else {
        showToast("Workspace URL updated!", "success");
      }
      onClose();
      router.push(`/s/${data.newSlug}`);
    } catch {
      showToast("Connection error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Rename Workspace URL" maxWidth="max-w-sm sm:max-w-md">
      <div className="flex flex-col gap-3.5 pt-0.5 min-w-0 max-w-full overflow-x-hidden">
        {/* Current URL Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] min-w-0 max-w-full overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-indigo)] shrink-0 shadow-sm">
            <Globe size={18} />
          </div>
          <div className="min-w-0 max-w-full flex-1">
            <p className="text-xs font-bold text-[var(--text-subtle)] dark:text-[var(--text-muted)] uppercase tracking-wider font-mono">Current Workspace</p>
            <p className="text-sm sm:text-base font-extrabold text-[var(--text-main)] font-mono truncate max-w-full">/s/{slug}</p>
          </div>
        </div>

        {/* New Slug Input */}
        <div>
          <label htmlFor="new-slug-input" className="block text-xs font-bold text-[var(--text-muted)] mb-1 font-mono">
            New Workspace URL
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-mono text-[var(--text-subtle)] font-extrabold select-none">
              /s/
            </span>
            <input
              autoFocus
              id="new-slug-input"
              name="newSlug"
              aria-label="Enter new workspace URL slug"
              value={newSlug}
              onChange={(e) => handleSlugChange(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onClose();
              }}
              placeholder="my-custom-space"
              className={`
                w-full min-w-0 max-w-full pl-9 pr-24 py-2.5 bg-[var(--input-bg)] border rounded-xl text-base sm:text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] dark:placeholder-[var(--text-muted)] font-mono min-h-[44px] sm:min-h-[40px]
                outline-none transition-all shadow-inner font-bold
                ${slugError
                  ? "border-[var(--status-danger-border)] focus:ring-2 focus:ring-[var(--status-danger-border)]"
                  : available === false ? "border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)]"
                  : available === true  ? "border-[var(--status-success-border)] focus:ring-2 focus:ring-[var(--status-success-border)]"
                  : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)]"
                }
              `}
            />
            {newSlug !== slug && !slugError && (
              <span className={`absolute right-3 text-xs font-bold font-mono pointer-events-none whitespace-nowrap ${
                checking ? "text-[var(--text-muted)] animate-pulse" : available ? "text-[var(--status-success-text)]" : "text-[var(--accent-primary)]"
              }`}>
                {checking ? "Checking…" : available ? "✓ Available" : "Open ➔"}
              </span>
            )}
          </div>
          {slugError && (
            <p className="text-xs text-[var(--status-danger-text)] mt-1 font-semibold px-1 break-words min-w-0 max-w-full">
              {slugError}
            </p>
          )}
          {available === false && !slugError && (
            <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium px-1 break-words min-w-0 max-w-full">
              This space already exists. Renaming will navigate to the existing workspace.
            </p>
          )}
        </div>

        {/* Retention Policy Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[var(--text-muted)] min-w-0 max-w-full overflow-hidden">
          <Clock size={16} className="text-[var(--accent-indigo)] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-xs min-w-0 break-words">
            <strong className="text-[var(--text-main)]">Data Retention:</strong> Inactive spaces may be pruned after 30 days of inactivity. Please export important notes and files to keep offline copies.
          </p>
        </div>

        {/* Danger Zone: Permanent Deletion */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2.5 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-xs min-w-0 max-w-full overflow-hidden">
          <div className="min-w-0 max-w-full">
            <p className="font-bold text-[var(--status-danger-text)]">Delete Workspace</p>
            <p className="text-xs text-[var(--text-muted)]">Permanently erase notes and all files.</p>
          </div>
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowDeleteConfirm(true)}
            icon={<Trash2 size={14} />}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 mt-1 border-t border-[var(--border-color)] shrink-0">
          <Button variant="secondary" size="md" onClick={onClose} className="font-bold w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!!slugError || !newSlug || newSlug === slug || checking}
            loading={saving}
            onClick={handleSave}
            icon={available === false ? <ArrowRight size={15} /> : <Check size={15} />}
            className="font-bold w-full sm:w-auto"
          >
            {available === false ? "Open Existing Space" : "Save New URL"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete /s/${slug}?`}
        description="This action is irreversible. All Markdown notes and uploaded files in this workspace will be deleted immediately."
        confirmText="Yes, Delete Permanently"
        variant="danger"
      />
    </Modal>
  );
}
