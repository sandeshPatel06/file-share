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
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=0f172a&bgcolor=ffffff&margin=8`;

  return (
    <Modal open={open} onClose={onClose} title="Scan QR Code to Open Space" maxWidth="max-w-xs sm:max-w-sm">
      <div className="flex flex-col items-center justify-center pt-0.5 text-center">
        {/* QR Code Card Frame */}
        <div className="p-3 rounded-xl bg-white border border-[var(--border-color)] shadow-md mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt={`QR code for ${url}`}
            width={180}
            height={180}
            className="rounded-lg border border-slate-100"
          />
        </div>

        <p className="text-xs text-[var(--text-muted)] font-medium mb-3 max-w-xs leading-relaxed">
          Scan this QR code using your phone camera to open <span className="text-[var(--accent-indigo)] font-extrabold font-mono">/s/{slug}</span> instantly.
        </p>

        {/* URL Copy Bar */}
        <div className="w-full flex items-center bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl p-1 mb-2.5">
          <input
            readOnly
            value={url}
            className="flex-1 px-2.5 py-1 text-xs text-[var(--text-main)] bg-transparent outline-none font-mono truncate select-all font-bold"
          />
          <Button size="sm" variant={copied ? "success" : "secondary"} icon={copied ? <CheckCheck size={13} /> : <Copy size={13} />} onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
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
