"use client";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Lock, Unlock, Copy, CheckCheck, QrCode, PanelRightClose, PanelRightOpen } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { QRCodeModal } from "@/components/QRCodeModal";
import { RenameSlugModal } from "@/components/RenameSlugModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { copyToClipboard } from "@/lib/clipboard";

interface SlugBarProps {
  slug:        string;
  isProtected: boolean;
  token:       string | null;
  onLockClick: () => void;
  onToggleFilePanel?: () => void;
  filePanelOpen?: boolean;
}

export function SlugBar({ slug, isProtected, token, onLockClick, onToggleFilePanel, filePanelOpen }: SlugBarProps) {
  const [copied,          setCopied]          = useState(false);
  const [showQR,          setShowQR]          = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

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
      {/* Workspace Brand & Interactive Workspace Pill */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="relative group flex items-center gap-2 shrink-0 cursor-pointer no-underline"
          title="FileShare Home"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-[var(--accent-indigo)] via-indigo-400 to-purple-500 shadow-md group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-[9px] sm:rounded-[10px] overflow-hidden bg-[var(--bg-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="FileShare Logo" width={32} height={32} decoding="async" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-main)] hidden sm:inline group-hover:text-[var(--accent-indigo)] transition-colors">
            FileShare
          </span>
        </Link>

        {/* Interactive Workspace Slug Pill */}
        <button
          onClick={() => setShowRenameModal(true)}
          title="Click to edit workspace URL"
          aria-label="Click to edit workspace URL"
          className="group/pill flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-xl bg-[var(--badge-bg)] hover:bg-[var(--border-color)]/60 border border-[var(--border-color)] hover:border-[var(--accent-indigo)]/40 transition-all duration-200 cursor-pointer min-w-0 shadow-sm"
        >
          <span className="text-xs sm:text-sm font-extrabold text-[var(--text-main)] group-hover/pill:text-[var(--accent-indigo)] truncate max-w-[100px] min-[400px]:max-w-[160px] sm:max-w-[240px] font-mono tracking-tight transition-colors">
            {slug}
          </span>
          <span className="p-0.5 rounded-md text-[var(--text-subtle)] group-hover/pill:text-[var(--accent-indigo)] group-hover/pill:bg-[var(--accent-indigo)]/10 transition-all ml-0.5 shrink-0">
            <Pencil size={12} />
          </span>
        </button>
      </div>

      {/* Header Actions Toolbar */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
        <button
          onClick={() => setShowQR(true)}
          className="p-1.5 sm:p-2 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:opacity-80 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Show QR Code"
          aria-label="Show QR Code"
        >
          <QrCode size={14} />
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold active:scale-95 transition-all duration-200 border shadow-sm cursor-pointer
            ${copied
              ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]"
              : "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
          title="Copy workspace link"
          aria-label="Copy workspace link"
        >
          {copied ? <CheckCheck size={14} className="text-[var(--status-success-text)]" /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {/* Password Lock Button */}
        <button
          onClick={onLockClick}
          title={isProtected ? "Protected with password" : "Set protection password"}
          aria-label={isProtected ? "Protected with password" : "Set protection password"}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border shadow-sm cursor-pointer
            ${isProtected
              ? "bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]"
              : "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
        >
          {isProtected ? <Lock size={14} className="text-[var(--badge-text)]" /> : <Unlock size={14} />}
          <span className="hidden sm:inline">{isProtected ? "Protected" : "Protect"}</span>
        </button>

        <a
          href="https://github.com/sandeshPatel06/file-share"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 sm:p-2 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] hover:bg-[var(--border-color)] hover:scale-105 transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
          title="View GitHub Repository"
          aria-label="View GitHub Repository"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/github-icon.svg" alt="GitHub Repository" width={16} height={16} className="w-4 h-4 object-contain" />
        </a>

        <ThemeToggle />

        {onToggleFilePanel && (
          <button
            onClick={onToggleFilePanel}
            title={filePanelOpen ? "Hide File Explorer" : "Show File Explorer"}
            aria-label={filePanelOpen ? "Hide File Explorer" : "Show File Explorer"}
            className={`
              p-1.5 sm:p-2 rounded-xl border transition-all shadow-sm cursor-pointer flex items-center justify-center shrink-0
              ${filePanelOpen
                ? "bg-[var(--accent-indigo)]/15 text-[var(--accent-indigo)] border-[var(--accent-indigo)]/40 hover:bg-[var(--accent-indigo)]/25"
                : "bg-[var(--badge-bg)] text-[var(--text-main)] border-[var(--border-color)] hover:opacity-80"
              }
            `}
          >
            {filePanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </button>
        )}
      </div>

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        slug={slug}
      />

      <RenameSlugModal
        key={showRenameModal ? `${slug}-open` : `${slug}-closed`}
        open={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        slug={slug}
        token={token}
      />
    </div>
  );
}
