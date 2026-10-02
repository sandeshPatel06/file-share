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

        <form onSubmit={handleSet} className="space-y-3.5">
          <div>
            <label htmlFor="new-password-input" className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                autoFocus
                id="new-password-input"
                name="newPassword"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition-all font-mono font-bold min-h-[40px]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password-input" className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              id="confirm-password-input"
              name="confirmPassword"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition-all font-mono font-bold min-h-[40px]"
            />
          </div>

          {error && <p className="text-xs font-bold text-[var(--status-danger-text)] flex items-center gap-1.5 pt-0.5">{error}</p>}

          <div className="flex gap-2.5 pt-2 border-t border-[var(--border-color)] mt-2">
            <Button type="submit" size="md" icon={<KeyRound size={16} />} loading={loading} className="flex-1 font-bold">
              Set Password
            </Button>
            {isProtected && (
              <Button
                type="button"
                size="md"
                variant="danger"
                icon={<Unlock size={16} />}
                loading={loading}
                onClick={handleRemove}
                className="font-bold"
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
