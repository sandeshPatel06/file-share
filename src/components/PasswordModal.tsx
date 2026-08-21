"use client";
import { useState } from "react";
import { KeyRound, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";

interface PasswordModalProps {
  open:        boolean;
  onClose:     () => void;
  slug:        string;
  isProtected: boolean;
  token:       string | null;
  onSuccess:   (newProtected: boolean, newToken?: string) => void;
}

export function PasswordModal({ open, onClose, slug, isProtected, token, onSuccess }: PasswordModalProps) {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  function reset() { setPassword(""); setConfirm(""); setError(""); setShowPw(false); }

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}/password`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }

      // Get new token for the new password
      const verifyRes = await fetch(`/api/pages/${slug}/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const verifyData = await verifyRes.json();

      showToast("Password set successfully", "success");
      onSuccess(true, verifyData.token);
      reset(); onClose();
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}/password`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: null }),
      });
      if (!res.ok) { setError("Failed to remove password"); return; }
      showToast("Password removed", "info");
      onSuccess(false);
      reset(); onClose();
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={isProtected ? "Change Password" : "Set Password"} maxWidth="max-w-sm sm:max-w-md">
      <div className="flex flex-col gap-3.5 pt-0.5">
        {isProtected && (
          <div className="p-2.5 rounded-xl bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center gap-2">
            <Lock size={14} className="text-[var(--accent-indigo)] shrink-0" />
            <span className="text-xs font-bold text-[var(--badge-text)]">This page is currently password-protected.</span>
          </div>
        )}

        <form onSubmit={handleSet} className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</span>
            <div className="relative mt-1">
              <input
                autoFocus
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-xl px-3 py-2 pr-9 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition-all font-mono font-bold"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer p-1 rounded-md">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition-all font-mono font-bold"
            />
          </label>

          {error && <p className="text-xs font-bold text-[var(--status-danger-text)] flex items-center gap-1.5 pt-0.5">{error}</p>}

          <div className="flex gap-2 pt-2 border-t border-[var(--border-color)] mt-2">
            <Button type="submit" size="sm" icon={<KeyRound size={14} />} loading={loading} className="flex-1">
              Set Password
            </Button>
            {isProtected && (
              <Button
                type="button"
                size="sm"
                variant="danger"
                icon={<Unlock size={14} />}
                loading={loading}
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
