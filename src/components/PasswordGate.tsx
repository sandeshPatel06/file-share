"use client";
import { useState } from "react";
import { ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PasswordGateProps {
  slug:       string;
  onUnlocked: (token: string, rememberDevice?: boolean) => void;
}

export function PasswordGate({ slug, onUnlocked }: PasswordGateProps) {
  const [password, setPassword]             = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/pages/${slug}/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid password");
        return;
      }

      onUnlocked(data.token, rememberDevice);
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Glow Orbs — capped opacity so the green wash never oversaturates dark canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--border-glow)] rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-[min(28rem,calc(100vw-2rem))] animate-fade-in relative z-10 min-h-0 min-w-0">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-7 border border-[var(--border-color)] shadow-2xl text-center min-w-0 max-w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Cyber Lock Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] border border-[var(--badge-border)] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock size={26} className="text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)]">Protected Space</h2>
          <p title={`/s/${slug}`} className="text-xs font-mono text-[var(--accent-indigo)] font-bold mt-1 mb-4 truncate max-w-full px-2">/s/{slug}</p>

          <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed font-medium">
            This space is encrypted with a security passphrase. Enter password to view notes and files.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="password-gate-input" className="sr-only">
                Workspace Passphrase
              </label>
              <input
                autoFocus
                id="password-gate-input"
                name="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                aria-label="Workspace password"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-2xl px-4 py-3.5 pr-12 text-base sm:text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] dark:placeholder-[var(--text-muted)] outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember Unlock on this Device */}
            <label className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] cursor-pointer select-none text-left px-1">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-5 h-5 sm:w-4 sm:h-4 rounded border-[var(--border-color)] accent-[var(--accent-primary)] cursor-pointer shrink-0"
              />
              <span>Remember unlock on this device</span>
            </label>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-xs text-[var(--status-danger-text)] font-bold flex items-center gap-2 min-w-0 max-w-full text-left">
                <ShieldAlert size={15} className="shrink-0 text-[var(--status-danger-text)]" />
                <span className="min-w-0 break-words">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="glow"
              loading={loading}
              icon={<KeyRound size={18} />}
              iconRight={<ArrowRight size={18} />}
              disabled={!password}
              className="w-full py-3.5 text-sm font-bold tracking-wide"
            >
              Unlock Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
