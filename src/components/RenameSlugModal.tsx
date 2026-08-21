"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useRef } from "react";
import { showToast } from "@/components/ui/Toast";
import { slugSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, Check } from "lucide-react";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

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
      <div className="flex flex-col gap-3.5 pt-0.5">
        {/* Current URL Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-indigo)] shrink-0 shadow-sm">
            <Globe size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-wider font-mono">Current Workspace</p>
            <p className="text-xs sm:text-sm font-extrabold text-[var(--text-main)] font-mono truncate">/s/{slug}</p>
          </div>
        </div>

        {/* New Slug Input */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 font-mono">
            New Workspace URL
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-mono text-[var(--text-subtle)] font-extrabold select-none">
              /s/
            </span>
            <input
              autoFocus
              value={newSlug}
              onChange={(e) => handleSlugChange(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onClose();
              }}
              placeholder="my-custom-space"
              className={`
                w-full pl-9 pr-24 py-2 bg-[var(--input-bg)] border rounded-xl text-xs sm:text-sm text-[var(--text-main)] font-mono
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
              <span className={`absolute right-3 text-xs font-bold font-mono ${
                checking ? "text-[var(--text-muted)] animate-pulse" : available ? "text-[var(--status-success-text)]" : "text-[var(--accent-primary)]"
              }`}>
                {checking ? "Checking…" : available ? "✓ Available" : "Open ➔"}
              </span>
            )}
          </div>
          {slugError && (
            <p className="text-xs text-[var(--status-danger-text)] mt-1 font-semibold px-1">
              {slugError}
            </p>
          )}
          {available === false && !slugError && (
            <p className="text-xs text-[var(--accent-primary)] mt-1 font-medium px-1">
              This space already exists. Renaming will navigate to the existing workspace.
            </p>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-[var(--border-color)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!!slugError || !newSlug || newSlug === slug || checking}
            loading={saving}
            onClick={handleSave}
            icon={available === false ? <ArrowRight size={14} /> : <Check size={14} />}
          >
            {available === false ? "Open Existing Space" : "Save New URL"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
