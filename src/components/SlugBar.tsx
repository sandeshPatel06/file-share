"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Pencil, Lock, Unlock, Copy, CheckCheck, QrCode, PanelRightClose, PanelRightOpen, MoreVertical } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { QRCodeModal } from "@/components/QRCodeModal";
import { RenameSlugModal } from "@/components/RenameSlugModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { copyToClipboard } from "@/lib/clipboard";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

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
  const [showMoreMenu,    setShowMoreMenu]    = useState(false);
  const moreMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Dismiss the mobile More menu on Escape for keyboard users
  // (outside taps are already covered by the backdrop catcher).
  useEffect(() => {
    if (!showMoreMenu) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMoreMenu(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMoreMenu]);

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
    <div className="flex items-center justify-between gap-1 sm:gap-2 w-full min-w-0 max-w-full h-full select-none overflow-visible">
      {/* Workspace Brand & Interactive Workspace Pill */}
      <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink flex-1 overflow-hidden">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="relative group flex items-center gap-1.5 shrink-0 cursor-pointer no-underline"
          title="FileShare Home"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-[var(--accent-primary)] via-[var(--accent-indigo)] to-[var(--accent-cyan)] shadow-md group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-[9px] sm:rounded-[10px] overflow-hidden bg-[var(--bg-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="FileShare Logo" width={32} height={32} decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-main)] hidden sm:inline group-hover:text-[var(--accent-indigo)] transition-colors">
            FileShare
          </span>
        </Link>

        {/* Interactive Workspace Slug Pill */}
        <button
          type="button"
          onClick={() => setShowRenameModal(true)}
          title="Click to edit workspace URL"
          aria-label="Click to edit workspace URL"
          className="group/pill flex items-center gap-1 h-11 sm:h-9 px-2 sm:px-3 rounded-xl bg-[var(--badge-bg)] hover:bg-[var(--border-color)]/60 border border-[var(--border-color)] hover:border-[var(--accent-indigo)]/40 transition-all duration-200 cursor-pointer min-w-0 shrink max-w-full shadow-sm"
        >
          <span className="text-xs sm:text-sm font-extrabold text-[var(--text-main)] group-hover/pill:text-[var(--accent-indigo)] truncate max-w-[55px] min-[360px]:max-w-[85px] min-[400px]:max-w-[140px] sm:max-w-[240px] font-mono tracking-tight transition-colors">
            {slug}
          </span>
          <span className="p-0.5 rounded-md text-[var(--text-muted)] group-hover/pill:text-[var(--accent-indigo)] group-hover/pill:bg-[var(--accent-indigo)]/10 transition-all shrink-0">
            <Pencil size={12} />
          </span>
        </button>
      </div>

      {/* Header Actions Toolbar — tight mobile gaps so 320px viewports fit */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 ml-auto">
        {/* QR button: compact icon on mobile, labeled control on desktop */}
        <button
          type="button"
          onClick={() => setShowQR(true)}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center shrink-0 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] active:scale-95 transition-all shadow-sm cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]"
          title="Show QR Code"
          aria-label="Show QR Code"
        >
          <QrCode size={18} />
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={copyLink}
          className={`
            h-9 w-9 sm:h-10 sm:w-auto px-0 sm:px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all duration-200 border shadow-sm cursor-pointer shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]
            ${copied
              ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]"
              : "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
          title="Copy workspace link"
          aria-label="Copy workspace link"
        >
          {copied ? <CheckCheck size={18} className="text-[var(--status-success-text)]" /> : <Copy size={18} />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {/* Password Lock Button */}
        <button
          type="button"
          onClick={onLockClick}
          title={isProtected ? "Protected with password" : "Set protection password"}
          aria-label={isProtected ? "Protected with password" : "Set protection password"}
          className={`
            h-9 w-9 sm:h-10 sm:w-auto px-0 sm:px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border shadow-sm cursor-pointer shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]
            ${isProtected
              ? "bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]"
              : "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border-[var(--border-color)]"
            }
          `}
        >
          {isProtected ? <Lock size={18} className="text-[var(--badge-text)]" /> : <Unlock size={18} />}
          <span className="hidden sm:inline">{isProtected ? "Protected" : "Protect"}</span>
        </button>

        {/* Desktop GitHub Link */}
        <a
          href="https://github.com/sandeshPatel06/file-share"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex h-10 w-10 items-center justify-center shrink-0 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] hover:bg-[var(--border-color)] hover:scale-105 transition-all shadow-sm cursor-pointer min-h-[40px] min-w-[40px]"
          title="View GitHub Repository"
          aria-label="View GitHub Repository"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/github-icon.svg" alt="GitHub Repository" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
        </a>

        {/* Desktop Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Mobile More Actions Menu */}
        <div className="relative sm:hidden">
          <button
            ref={moreMenuButtonRef}
            type="button"
            onClick={() => setShowMoreMenu((prev) => !prev)}
            aria-label="More workspace tools"
            aria-expanded={showMoreMenu}
            title="More workspace tools"
             className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] active:scale-95 transition-all shadow-sm cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]"
          >
            <MoreVertical size={18} />
          </button>
           {showMoreMenu && (
             <>
              <div
                 className="fixed inset-0 z-[61]"
                onClick={() => setShowMoreMenu(false)}
              />
               <FloatingMenu open={showMoreMenu} anchorRef={moreMenuButtonRef} placement="bottom-end" className="w-48 max-w-[calc(100vw-1rem)] rounded-xl bg-[var(--modal-bg)] border border-[var(--border-color)] shadow-2xl p-1.5 flex flex-col gap-1 text-xs font-bold animate-slide-down">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowQR(true);
                  }}
                  aria-label="Show QR code"
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer min-h-[44px]"
                >
                  <QrCode size={16} className="text-[var(--accent-indigo)]" />
                  <span>Show QR Code</span>
                </button>
                 <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 min-h-[44px]">
                   <span className="text-[var(--text-main)]">Theme Mode</span>
                   <ThemeToggle />
                 </div>
                 <a
                  href="https://github.com/sandeshPatel06/file-share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer min-h-[44px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/github-icon.svg" alt="GitHub" width={16} height={16} className="w-4 h-4 object-contain" />
                   <span>GitHub Project</span>
                 </a>
               </FloatingMenu>
            </>
          )}
        </div>

        {/* File Panel Toggle */}
        {onToggleFilePanel && (
          <button
            type="button"
            onClick={onToggleFilePanel}
            aria-pressed={filePanelOpen}
            title={filePanelOpen ? "Hide File Explorer" : "Show File Explorer"}
            aria-label={filePanelOpen ? "Hide File Explorer" : "Show File Explorer"}
            className={`
               h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 rounded-xl border transition-all shadow-sm cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]
              ${filePanelOpen
                ? "bg-[var(--accent-indigo)]/15 text-[var(--accent-indigo)] border-[var(--accent-indigo)]/40 hover:bg-[var(--accent-indigo)]/25"
                : "bg-[var(--badge-bg)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--border-color)]"
              }
            `}
          >
            {filePanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
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
