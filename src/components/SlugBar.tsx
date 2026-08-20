"use client";
import { useState, useRef } from "react";
import { Pencil, Lock, Unlock, Check, X, Copy, CheckCheck, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { slugSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { QRCodeModal } from "@/components/QRCodeModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { copyToClipboard } from "@/lib/clipboard";

interface SlugBarProps {
  slug:        string;
  isProtected: boolean;
  token:       string | null;
  onLockClick: () => void;
}

export function SlugBar({ slug, isProtected, token, onLockClick }: SlugBarProps) {
  const [editing,   setEditing]   = useState(false);
  const [newSlug,   setNewSlug]   = useState(slug);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking,  setChecking]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [showQR,    setShowQR]    = useState(false);
  const [slugError, setSlugError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  function startEditing() { setNewSlug(slug); setAvailable(null); setSlugError(""); setEditing(true); }
  function cancelEditing() { setEditing(false); setSlugError(""); }

  function handleSlugChange(val: string) {
    setNewSlug(val);
    setAvailable(null);
    setSlugError("");

    const parsed = slugSchema.safeParse(val);
    if (!parsed.success) {
      setSlugError(parsed.error.issues[0]?.message ?? "Invalid slug");
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
      } catch { setAvailable(null); }
      finally { setChecking(false); }
    }, 400);
  }

  async function handleSave() {
    if (slugError || !newSlug || newSlug === slug) {
      setEditing(false);
      return;
    }

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
      if (!res.ok) { showToast(data.error ?? "Failed to navigate", "error"); return; }

      if (data.redirected) {
        showToast(`Opening existing space /s/${data.newSlug}…`, "info");
      } else {
        showToast("Space URL updated!", "success");
      }
      setEditing(false);
      router.push(`/s/${data.newSlug}`);
    } catch { showToast("Connection error", "error"); }
    finally { setSaving(false); setEditing(false); }
  }

  async function copyLink() {
    const url = `${window.location.origin}/s/${slug}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      showToast("Shareable link copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Could not copy link", "error");
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 w-full min-w-0 h-full select-none">
      {/* Slug Title or Inline Editing Input */}
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-sm">
          <span className="text-[var(--text-subtle)] text-xs font-mono select-none shrink-0">/s/</span>
          <div className="relative flex-1 min-w-0">
            <input
              autoFocus
              value={newSlug}
              onChange={(e) => handleSlugChange(e.target.value.toLowerCase())}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEditing(); }}
              className={`
                w-full bg-[var(--bg-main)] border rounded-xl px-3 py-1 text-xs sm:text-sm text-[var(--text-main)] font-mono
                outline-none transition-all
                ${slugError
                  ? "border-[var(--status-danger-border)] focus:ring-2 focus:ring-[var(--status-danger-border)]"
                  : available === false ? "border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)]"
                  : available === true  ? "border-[var(--status-success-border)] focus:ring-2 focus:ring-[var(--status-success-border)]"
                  : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)]"
                }
              `}
            />
            {!slugError && newSlug !== slug && (
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${
                checking ? "text-[var(--text-muted)]" : available ? "text-[var(--status-success-text)]" : "text-[var(--accent-primary)]"
              }`}>
                {checking ? "…" : available ? "✓ New" : "Open ➔"}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={available === false ? <ArrowRight size={13} /> : <Check size={13} />}
            disabled={!!slugError || newSlug === slug || checking}
            loading={saving}
            onClick={handleSave}
            title={available === false ? "Open existing workspace" : "Save workspace URL"}
            className="shrink-0 h-8"
          />
          <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={cancelEditing} className="shrink-0 h-8" />
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="w-7 h-7 rounded-xl overflow-hidden shadow-md border border-[var(--border-glow)] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FileShare Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-[var(--text-subtle)] text-xs font-mono select-none hidden sm:inline">/s/</span>
          <span className="text-xs sm:text-base font-extrabold text-[var(--text-main)] truncate max-w-[80px] min-[400px]:max-w-[140px] sm:max-w-[220px] font-mono tracking-tight">
            {slug}
          </span>
          <button
            onClick={startEditing}
            className="text-[var(--text-subtle)] hover:text-[var(--accent-indigo)] hover:bg-black/5 dark:hover:bg-white/10 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Edit workspace URL"
          >
            <Pencil size={13} />
          </button>
        </div>
      )}

      {/* Header Actions Toolbar */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
        <button
          onClick={() => setShowQR(true)}
          className="p-1.5 sm:p-2 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:opacity-80 transition-all shadow-sm cursor-pointer"
          title="Show QR Code"
        >
          <QrCode size={14} />
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border shadow-sm cursor-pointer
            ${copied
              ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]"
              : "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
          title="Copy workspace link"
        >
          {copied ? <CheckCheck size={14} className="text-[var(--status-success-text)]" /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {/* Password Lock Button */}
        <button
          onClick={onLockClick}
          title={isProtected ? "Protected with password" : "Set protection password"}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border shadow-sm cursor-pointer
            ${isProtected
              ? "text-[var(--badge-text)] bg-[var(--badge-bg)] border-[var(--badge-border)]"
              : "text-[var(--text-main)] bg-[var(--badge-bg)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
        >
          {isProtected ? <Lock size={14} /> : <Unlock size={14} />}
          <span className="hidden sm:inline">{isProtected ? "Protected" : "Protect"}</span>
        </button>

        <ThemeToggle />
      </div>

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        slug={slug}
      />
    </div>
  );
}
