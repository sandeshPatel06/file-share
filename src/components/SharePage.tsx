"use client";
import { useState, useEffect, useSyncExternalStore, useRef } from "react";
import { SlugBar } from "@/components/SlugBar";
import { TextEditor } from "@/components/TextEditor";
import { FilePanel } from "@/components/FilePanel";
import { PasswordGate } from "@/components/PasswordGate";
import { PasswordModal } from "@/components/PasswordModal";
import Link from "next/link";
import { PanelRightClose, FolderOpen, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRecentSpaces } from "@/hooks/useRecentSpaces";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

interface SharePageProps {
  pageData: {
    slug:        string;
    isProtected: boolean;
    content:     string;
  };
}

const emptySubscribe = () => () => {};

const subscribeDesktop = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(min-width: 640px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

const getIsDesktop = () => (typeof window !== "undefined" ? window.innerWidth >= 640 : true);
const getServerIsDesktop = () => true;

export function SharePage({ pageData }: SharePageProps) {
  const { slug, isProtected: initialProtected } = pageData;

  const storedToken = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(`token:${slug}`) || sessionStorage.getItem(`token:${slug}`);
    },
    () => null
  );

  const isDesktop = useSyncExternalStore(subscribeDesktop, getIsDesktop, getServerIsDesktop);
  const [userPanelToggle, setUserPanelToggle] = useState<boolean | null>(null);
  const showFilePanel = userPanelToggle ?? isDesktop;

  const [tokenState, setTokenState]           = useState<string | null>(null);
  const [isProtected, setIsProtected]         = useState(initialProtected);
  const [isUnlockedState, setIsUnlockedState] = useState(false);
  const [showPwModal, setShowPwModal]         = useState(false);
  const [showLegalMenu, setShowLegalMenu]     = useState(false);
  const legalMenuButtonRef = useRef<HTMLButtonElement>(null);
  const { addRecentSpace }                    = useRecentSpaces();

  useEffect(() => {
    if (slug) {
      addRecentSpace(slug);
    }
  }, [slug, addRecentSpace]);

  // Close on Escape key on mobile (file panel + legal dropdown)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setShowLegalMenu(false);
      if (showFilePanel && typeof window !== "undefined" && window.innerWidth < 640) {
        setUserPanelToggle(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilePanel]);

  const effectiveToken = tokenState ?? storedToken;
  const isUnlocked = !isProtected || Boolean(effectiveToken) || isUnlockedState;

  function handleUnlocked(newToken: string, rememberDevice?: boolean) {
    setTokenState(newToken);
    setIsUnlockedState(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`token:${slug}`, newToken);
      if (rememberDevice) {
        localStorage.setItem(`token:${slug}`, newToken);
      }
    }
  }

  function handleLockClick() {
    if (!isUnlocked) return;
    setShowPwModal(true);
  }

  if (isProtected && !isUnlocked) {
    return <PasswordGate slug={slug} onUnlocked={handleUnlocked} />;
  }

  return (
    <div className="flex flex-col h-dvh w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 relative">
      {/* Top Header Navigation */}
      <header className="h-11 sm:h-12 px-2 sm:px-3 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--border-color)] flex items-center shrink-0 z-[60] transition-colors duration-200">
        <SlugBar
          slug={slug}
          isProtected={isProtected}
          token={effectiveToken}
          onLockClick={handleLockClick}
          onToggleFilePanel={() => setUserPanelToggle(!showFilePanel)}
          filePanelOpen={showFilePanel}
        />
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Left Editor Pane */}
        <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col overflow-hidden">
          <TextEditor slug={slug} initialContent={pageData.content} token={effectiveToken} />
        </div>

        {/* Right File Explorer Sidebar — inert when closed so keyboard/screen-reader
            users can't tab into the off-screen (mobile) or zero-width (desktop) panel */}
        <aside
          inert={!showFilePanel}
          className={`
            absolute sm:static inset-y-0 right-0 z-40 sm:z-auto
            bg-[var(--bg-surface)]
            flex flex-col shrink-0 min-h-0 overflow-hidden overscroll-contain max-w-full
            transition-all duration-200 ease-in-out
            ${showFilePanel
              ? "translate-x-0 w-[280px] max-w-[85vw] sm:max-w-full sm:w-[300px] md:w-[320px] border-l border-[var(--border-color)] opacity-100 shadow-2xl sm:shadow-none"
              : "translate-x-full sm:translate-x-0 sm:w-0 sm:border-l-0 sm:opacity-0 sm:overflow-hidden"
            }
          `}
        >
          {/* Mobile close handle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] sm:hidden shrink-0">
            <div className="flex items-center gap-2 text-[var(--text-main)] font-extrabold">
              <FolderOpen size={16} className="text-[var(--accent-indigo)]" />
              <span className="text-xs uppercase tracking-wider font-mono">Explorer</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setUserPanelToggle(false)}
              className="!p-2 !rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] min-h-[44px] min-w-[44px]"
              aria-label="Close file explorer"
              icon={<PanelRightClose size={16} />}
            />
          </div>
          <FilePanel slug={slug} token={effectiveToken} />
        </aside>

        {/* Mobile overlay backdrop */}
        {showFilePanel && (
          <div
            aria-hidden="true"
            className="sm:hidden absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setUserPanelToggle(false)}
          />
        )}
      </main>

      <PasswordModal
        slug={slug}
        isProtected={isProtected}
        token={effectiveToken}
        open={showPwModal}
        onClose={() => setShowPwModal(false)}
        onSuccess={(protectedState) => setIsProtected(protectedState)}
      />

      <footer className="border-t border-[var(--border-color)] bg-[var(--header-bg)] h-7 min-h-7 py-0 px-2 sm:px-3 shrink-0 text-[10px] sm:text-xs text-[var(--text-muted)] flex flex-wrap items-center justify-center sm:justify-between gap-1.5 sm:gap-2 z-20 font-medium overflow-visible">
        <div className="hidden sm:flex items-center gap-1.5 min-w-0 max-w-full flex-1 overflow-hidden">
          <span className="truncate min-w-0">Workspace: <code className="font-mono font-semibold text-[var(--text-main)] truncate max-w-[45vw] sm:max-w-[280px] inline-block align-bottom">/s/{slug}</code></span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-0 max-w-full whitespace-nowrap">
          <Link href="/guide" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors">User Guide</Link>
          <span className="text-[var(--text-subtle)]">•</span>
          <Link href="/resources" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
          <span className="text-[var(--text-subtle)]">•</span>
          <Link href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors">About</Link>
          <span className="text-[var(--text-subtle)]">•</span>
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>

          {/* Mobile Legal dropdown */}
          <div className="relative sm:hidden">
            <button
              ref={legalMenuButtonRef}
              type="button"
              onClick={() => setShowLegalMenu(!showLegalMenu)}
              aria-expanded={showLegalMenu}
              aria-label="Legal links"
              className="hover:text-[var(--text-main)] transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold py-0.5 px-1 min-h-7"
            >
              Legal <ChevronUp size={12} className={`transition-transform duration-200 ${showLegalMenu ? "rotate-180" : ""}`} />
            </button>
            {showLegalMenu && (
              <FloatingMenu open={showLegalMenu} anchorRef={legalMenuButtonRef} placement="top-end" className="w-40 max-w-[calc(100vw-2rem)] rounded-xl bg-[var(--modal-bg)] border border-[var(--border-color)] shadow-2xl p-1 flex flex-col gap-0.5 text-xs">
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] min-h-8 flex items-center" onClick={() => setShowLegalMenu(false)}>Privacy Policy</Link>
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] min-h-8 flex items-center" onClick={() => setShowLegalMenu(false)}>Terms of Service</Link>
                <Link href="/cookies" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] min-h-8 flex items-center" onClick={() => setShowLegalMenu(false)}>Cookie Policy</Link>
                <Link href="/refund" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] min-h-8 flex items-center" onClick={() => setShowLegalMenu(false)}>Refund Policy</Link>
              </FloatingMenu>
            )}
          </div>

          {/* Desktop inline legal links */}
          <span className="hidden sm:inline text-[var(--text-subtle)]">•</span>
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:text-[var(--text-main)] transition-colors">Privacy</Link>
          <span className="hidden sm:inline text-[var(--text-subtle)]">•</span>
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:text-[var(--text-main)] transition-colors">Terms</Link>
          <span className="hidden sm:inline text-[var(--text-subtle)]">•</span>
          <Link href="/cookies" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:text-[var(--text-main)] transition-colors">Cookies</Link>
          <span className="hidden sm:inline text-[var(--text-subtle)]">•</span>
          <Link href="/refund" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:text-[var(--text-main)] transition-colors">Refund</Link>
        </div>
      </footer>
    </div>
  );
}
