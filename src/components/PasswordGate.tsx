"use client";
import { useState } from "react";
import { ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PasswordGateProps {
  slug:       string;
  onUnlocked: (token: string) => void;
}

export function PasswordGate({ slug, onUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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

      onUnlocked(data.token);
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--border-glow)] rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md animate-fade-in relative z-10">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-7 border border-[var(--border-color)] shadow-2xl text-center">
          {/* Cyber Lock Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock size={26} className="text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)]">Protected Space</h2>
          <p className="text-xs font-mono text-[var(--accent-indigo)] font-bold mt-1 mb-4">/s/{slug}</p>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-5 leading-relaxed font-medium">
            This space is encrypted with a security passphrase. Enter password to view notes and files.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                autoFocus
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--border-glow)] rounded-2xl px-4 py-3.5 pr-12 text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none font-mono"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-xs text-[var(--status-danger-text)] font-bold flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0 text-[var(--status-danger-text)]" />
                <span>{error}</span>
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
