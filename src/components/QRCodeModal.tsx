"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, CheckCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { showToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/clipboard";

interface QRCodeModalProps {
  open:    boolean;
  onClose: () => void;
  slug:    string;
}

export function QRCodeModal({ open, onClose, slug }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/s/${slug}` : `/s/${slug}`;

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      showToast("Share link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Failed to copy link", "error");
    }
  }

  // Pure clean QR Code format readable by all camera readers
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&color=0f172a&bgcolor=ffffff&margin=10`;

  return (
    <Modal open={open} onClose={onClose} title="Scan QR Code to Open Space">
      <div className="flex flex-col items-center justify-center p-2 text-center">
        {/* QR Code Card Frame */}
        <div className="p-4 rounded-2xl bg-white border border-[var(--border-color)] shadow-lg mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt={`QR code for ${url}`}
            width={200}
            height={200}
            className="rounded-xl shadow-inner border border-slate-100"
          />
        </div>

        <p className="text-xs text-[var(--text-muted)] font-medium mb-5 max-w-xs leading-relaxed">
          Scan this QR code using your phone camera to open <span className="text-[var(--accent-indigo)] font-bold font-mono">/s/{slug}</span> instantly.
        </p>

        {/* URL Copy Bar */}
        <div className="w-full flex items-center bg-[var(--input-bg)] border border-[var(--border-color)] rounded-2xl p-1.5 mb-4">
          <input
            readOnly
            value={url}
            className="flex-1 px-3 py-1.5 text-xs text-[var(--text-main)] bg-transparent outline-none font-mono truncate select-all font-bold"
          />
          <Button size="sm" variant={copied ? "success" : "secondary"} icon={copied ? <CheckCheck size={13} /> : <Copy size={13} />} onClick={handleCopy}>
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        <a href={url} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="outline" size="sm" icon={<ExternalLink size={13} />} className="w-full text-xs font-bold">
            Open in new tab
          </Button>
        </a>
      </div>
    </Modal>
  );
}
