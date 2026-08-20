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
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col gap-4 text-center p-1">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] flex items-center justify-center text-[var(--status-danger-text)] mx-auto shadow-sm">
          <AlertTriangle size={24} />
        </div>

        {/* Message */}
        <div>
          <p className="text-sm font-extrabold text-[var(--text-main)] mb-1">{title}</p>
          <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">{description}</p>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
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
