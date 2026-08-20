"use client";
import { useState, useSyncExternalStore } from "react";
import { SlugBar } from "@/components/SlugBar";
import { TextEditor } from "@/components/TextEditor";
import { FilePanel } from "@/components/FilePanel";
import { PasswordGate } from "@/components/PasswordGate";
import { PasswordModal } from "@/components/PasswordModal";
import { FileText, FolderOpen } from "lucide-react";

interface SharePageProps {
  pageData: {
    slug:        string;
    isProtected: boolean;
    content:     string;
  };
}

const emptySubscribe = () => () => {};

export function SharePage({ pageData }: SharePageProps) {
  const { slug, isProtected: initialProtected } = pageData;

  const storedToken = useSyncExternalStore(
    emptySubscribe,
    () => (typeof window !== "undefined" ? sessionStorage.getItem(`token:${slug}`) : null),
    () => null
  );

  const [tokenState, setTokenState]     = useState<string | null>(null);
  const [isProtected, setIsProtected]   = useState(initialProtected);
  const [isUnlockedState, setIsUnlockedState] = useState(false);
  const [showPwModal, setShowPwModal]   = useState(false);
  const [activeTab, setActiveTab]       = useState<"editor" | "files">("editor");

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
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--border-color)] flex items-center shrink-0 z-30 transition-colors duration-200">
        <SlugBar
          slug={slug}
          isProtected={isProtected}
          token={effectiveToken}
          onLockClick={handleLockClick}
        />
      </header>

      {/* Main Workspace Dual-Pane View */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        {/* Left Pane — Live Text Editor */}
        <div className={`
          flex-1 md:flex flex-col min-h-0 h-full border-r border-[var(--border-color)] transition-all duration-200 pb-20 md:pb-0
          ${activeTab === "editor" ? "flex" : "hidden md:flex"}
        `}>
          <TextEditor slug={slug} initialContent={pageData.content} token={effectiveToken} />
        </div>

        {/* Right Pane — Shared Files Vault */}
        <div className={`
          w-full md:w-[400px] lg:w-[460px] md:flex flex-col min-h-0 h-full shrink-0 transition-all duration-200 pb-20 md:pb-0
          ${activeTab === "files" ? "flex" : "hidden md:flex"}
        `}>
          <FilePanel slug={slug} token={effectiveToken} />
        </div>
      </main>

      {/* Mobile Floating Segmented Tab Switcher (< 768px) */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 p-1.5 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl flex items-center gap-1.5 max-w-[90vw]">
        <button
          onClick={() => setActiveTab("editor")}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer
            ${activeTab === "editor"
              ? "bg-[var(--accent-primary)] text-white shadow-md scale-105"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
            }
          `}
        >
          <FileText size={15} />
          <span>Notes Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer
            ${activeTab === "files"
              ? "bg-[var(--accent-primary)] text-white shadow-md scale-105"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
            }
          `}
        >
          <FolderOpen size={15} />
          <span>Files Vault</span>
        </button>
      </div>

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
