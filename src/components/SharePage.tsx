"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { SlugBar } from "@/components/SlugBar";
import { TextEditor } from "@/components/TextEditor";
import { FilePanel } from "@/components/FilePanel";
import { PasswordGate } from "@/components/PasswordGate";
import { PasswordModal } from "@/components/PasswordModal";
import { PanelRightClose, FolderOpen } from "lucide-react";

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
    () => (typeof window !== "undefined" ? sessionStorage.getItem(`token:${slug}`) : null),
    () => null
  );

  const isDesktop = useSyncExternalStore(subscribeDesktop, getIsDesktop, getServerIsDesktop);
  const [userPanelToggle, setUserPanelToggle] = useState<boolean | null>(null);
  const showFilePanel = userPanelToggle ?? isDesktop;

  const [tokenState, setTokenState]           = useState<string | null>(null);
  const [isProtected, setIsProtected]         = useState(initialProtected);
  const [isUnlockedState, setIsUnlockedState] = useState(false);
  const [showPwModal, setShowPwModal]         = useState(false);

  // Close on Escape key on mobile
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showFilePanel && typeof window !== "undefined" && window.innerWidth < 640) {
        setUserPanelToggle(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilePanel]);

  const effectiveToken = tokenState ?? storedToken;
  const isUnlocked = !isProtected || Boolean(effectiveToken) || isUnlockedState;

  function handleUnlocked(newToken: string) {
    setTokenState(newToken);
    setIsUnlockedState(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`token:${slug}`, newToken);
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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 relative">
      {/* Top Header Navigation */}
      <header className="h-12 sm:h-13 px-2.5 sm:px-4 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--border-color)] flex items-center shrink-0 z-30 transition-colors duration-200">
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
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <TextEditor slug={slug} initialContent={pageData.content} token={effectiveToken} />
        </div>

        {/* Right File Explorer Sidebar */}
        <aside
          className={`
            fixed sm:static inset-y-0 right-0 z-40 sm:z-auto
            bg-[var(--bg-surface)]
            flex flex-col shrink-0
            transition-all duration-200 ease-in-out
            ${showFilePanel
              ? "translate-x-0 w-[280px] sm:w-[300px] md:w-[320px] border-l border-[var(--border-color)] opacity-100 shadow-2xl sm:shadow-none"
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
            <button
              onClick={() => setUserPanelToggle(false)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors"
              aria-label="Close file explorer"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <FilePanel slug={slug} token={effectiveToken} />
        </aside>

        {/* Mobile overlay backdrop */}
        {showFilePanel && (
          <div
            className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
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
    </div>
  );
}
