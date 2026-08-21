"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open:         boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title:        string;
  description:  string;
  confirmText?: string;
  cancelText?:  string;
  variant?:     "danger" | "primary" | "secondary" | "ghost" | "outline";
  loading?:     boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText  = "Cancel",
  variant     = "danger",
  loading     = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xs sm:max-w-sm">
      <div className="flex flex-col text-center pt-1">
        {/* Warning Icon Badge */}
        <div className="w-10 h-10 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] flex items-center justify-center text-[var(--status-danger-text)] mx-auto shadow-sm shrink-0">
          <AlertTriangle size={20} />
        </div>

        {/* Message */}
        <div className="mt-2.5">
          <h3 className="text-sm font-extrabold text-[var(--text-main)] mb-1">{title}</h3>
          <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">{description}</p>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            size="sm"
            loading={loading}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
