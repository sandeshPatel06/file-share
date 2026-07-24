/**
 * Robust copy-to-clipboard function supporting both modern navigator.clipboard API
 * and legacy execCommand fallback (for HTTP, local network IPs, and restricted mobile browsers).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard API if available (HTTPS or localhost)
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard failed, attempting fallback:", err);
  }

  // 2. Fallback using temporary textarea element and document.execCommand('copy')
  try {
    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      textarea.style.opacity = "0";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (successful) return true;
    }
  } catch (err) {
    console.error("execCommand fallback failed:", err);
  }

  return false;
}
