"use client";
import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const emptySubscribe = () => () => {};

export function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Dialog Box */}
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full ${maxWidth} bg-[var(--modal-bg)] text-[var(--text-main)]
          rounded-2xl p-4 sm:p-5 border border-[var(--border-color)]
          shadow-2xl z-[10000] my-auto animate-slide-up overflow-hidden transition-all
        `}
      >
        {/* Header */}
        {title ? (
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-color)]">
            <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-main)] truncate pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer z-10"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export const Dialog = Modal;
