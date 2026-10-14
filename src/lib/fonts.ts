/**
 * Adaptive font tiers — pick the best font payload for the user's network.
 *
 * Tier order (top → bottom):
 *   "full"     — Plus Jakarta Sans (400–800) + JetBrains Mono (400–700). Best
 *                rendering, biggest download. Fast networks only.
 *   "balanced" — Same families, core weights only (Sans 400/700/800,
 *                Mono 400/700). Missing weights are synthesized by the
 *                browser. Medium networks / low-end devices.
 *   "lite"     — System font stack, zero webfont bytes. Slow networks,
 *                2G, or Data-Saver.
 *
 * Classification uses the Network Information API
 * (`navigator.connection`: effectiveType / downlink / rtt / saveData) with
 * device hints (deviceMemory / hardwareConcurrency). No extra probe
 * requests — classification itself must cost zero bytes on slow networks.
 */

export type FontTier = "full" | "balanced" | "lite";

export const FONT_TIER_ORDER: FontTier[] = ["full", "balanced", "lite"];

const TIER_STYLESHEETS: Record<Exclude<FontTier, "lite">, string> = {
  full: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  balanced:
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono:wght@400;700&display=swap",
};

export function googleFontsUrl(tier: FontTier): string | null {
  if (tier === "lite") return null;
  return TIER_STYLESHEETS[tier];
}

interface NetworkConnectionInfo {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g" | string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

export interface NetworkSnapshot {
  effectiveType: string;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
}

export function readConnection(): NetworkConnectionInfo | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & {
    connection?: NetworkConnectionInfo;
  };
  return nav.connection ?? null;
}

export function snapshotNetwork(): NetworkSnapshot {
  const conn = readConnection();
  const navMemory = navigator as Navigator & {
    deviceMemory?: number;
  };
  return {
    effectiveType: conn?.effectiveType ?? "unknown",
    downlink: typeof conn?.downlink === "number" ? conn.downlink : null,
    rtt: typeof conn?.rtt === "number" ? conn.rtt : null,
    saveData: conn?.saveData === true,
    deviceMemory:
      typeof navMemory.deviceMemory === "number" ? navMemory.deviceMemory : null,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : null,
  };
}

/**
 * Pure classifier — sync, zero I/O. Slow/unknown-safe: anything that looks
 * constrained (or explicitly metered) steps down a tier.
 */
export function classifyNetwork(snap: NetworkSnapshot): FontTier {
  // Data-Saver always wins — user explicitly asked for less data.
  if (snap.saveData) return "lite";

  // Very slow links — no webfonts at all.
  if (snap.effectiveType === "slow-2g" || snap.effectiveType === "2g") return "lite";
  if (snap.downlink !== null && snap.downlink < 0.8) return "lite";

  // Low-end device — cap at balanced even on decent networks
  // (font decode + raster cost matters as much as bytes).
  const lowEndDevice =
    (snap.deviceMemory !== null && snap.deviceMemory <= 2) ||
    (snap.hardwareConcurrency !== null && snap.hardwareConcurrency <= 2);

  // Medium links — same families, fewer weights.
  if (snap.effectiveType === "3g") return "balanced";
  if (snap.downlink !== null && snap.downlink < 2.5) return "balanced";
  if (snap.rtt !== null && snap.rtt > 400) return "balanced";
  if (lowEndDevice) return "balanced";

  return "full";
}

// ── Tier persistence (so repeat visits skip re-classification) ──

const TIER_KEY = "fs-font-tier";
const TIER_TS_KEY = "fs-font-tier-ts";
const TIER_TTL_MS = 24 * 60 * 60 * 1000;

export function readCachedTier(): FontTier | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const tier = localStorage.getItem(TIER_KEY);
    const ts = Number(localStorage.getItem(TIER_TS_KEY) ?? "0");
    if (tier !== "full" && tier !== "balanced" && tier !== "lite") return null;
    if (!Number.isFinite(ts) || Date.now() - ts > TIER_TTL_MS) return null;
    return tier;
  } catch {
    return null;
  }
}

export function writeCachedTier(tier: FontTier): void {
  try {
    localStorage.setItem(TIER_KEY, tier);
    localStorage.setItem(TIER_TS_KEY, String(Date.now()));
  } catch {
    // Private mode / blocked storage — non-fatal.
  }
}
