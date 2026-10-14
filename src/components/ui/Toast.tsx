"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

let globalShowToast: ((msg: string, type?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "info") {
  globalShowToast?.(message, type);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={17} className="text-[var(--status-success-text)] shrink-0" />,
  error:   <AlertCircle size={17} className="text-[var(--status-danger-text)] shrink-0" />,
  info:    <Info        size={17} className="text-[var(--accent-indigo)] shrink-0" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-[var(--bg-card)] border-[var(--status-success-border)] text-[var(--text-main)] shadow-2xl",
  error:   "bg-[var(--bg-card)] border-[var(--status-danger-border)] text-[var(--text-main)] shadow-2xl",
  info:    "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] shadow-2xl",
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => { globalShowToast = addToast; return () => { globalShowToast = null; }; }, [addToast]);

  return (
    <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-5 sm:right-5 z-[10000] flex flex-col gap-2 pointer-events-none pb-[env(safe-area-inset-bottom)] max-h-[50vh] overflow-hidden min-w-0 w-full sm:w-auto max-w-[min(21.25rem,calc(100vw-2rem))]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-2.5
            border rounded-xl px-3.5 py-2.5 shadow-2xl opacity-100
            text-xs font-bold w-full sm:w-auto sm:min-w-[240px] sm:max-w-[340px] max-w-[calc(100vw-2rem)]
            animate-slide-up ${toastStyles[toast.type]}
          `}
        >
          {icons[toast.type]}
          <span className="flex-1 min-w-0 break-words leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center -mr-1 cursor-pointer shrink-0"
            title="Close"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
