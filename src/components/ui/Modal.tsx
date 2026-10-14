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
  const dialogRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll and auto-focus dialog
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Auto-focus dialog box or first input
      setTimeout(() => {
        const input = dialogRef.current?.querySelector<HTMLInputElement | HTMLButtonElement>("input, button, [tabindex]");
        if (input) {
          input.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Box */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        className={`
          relative w-full ${maxWidth} max-w-[calc(100vw-1.5rem)] min-w-0 max-h-[88vh] bg-[var(--modal-bg)] text-[var(--text-main)]
          rounded-2xl p-4 sm:p-5 border border-[var(--border-color)]
          shadow-2xl z-[10000] my-auto flex flex-col animate-scale-in outline-none overflow-hidden
        `}
      >
        {/* Header */}
        {title ? (
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-color)] shrink-0 select-none">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] truncate pr-2 min-w-0 flex-1">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer z-10 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Scrollable Body — single scroll node inside dialog */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export const Dialog = Modal;
