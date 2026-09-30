"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, Settings, Check, X } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = "fileshare_cookie_consent";

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
};

function applyGtagConsent(prefs: CookiePreferences) {
  if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.marketing ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
    });
  }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cookie_preferences_changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie_preferences_changed", callback);
  };
}

function getConsentSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getConsentServerSnapshot(): string | null {
  return "";
}

export function CookieConsent() {
  const rawConsent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
  const [manualOpen, setManualOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (rawConsent) {
      try {
        const parsed = JSON.parse(rawConsent) as CookiePreferences;
        applyGtagConsent(parsed);
      } catch {
        applyGtagConsent(DEFAULT_PREFERENCES);
      }
    } else if (rawConsent === null) {
      applyGtagConsent(DEFAULT_PREFERENCES);
    }
  }, [rawConsent]);

  useEffect(() => {
    const handleReopen = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPreferences(JSON.parse(stored));
        }
      } catch {
        // use default
      }
      setIsCustomizeOpen(true);
      setManualOpen(true);
    };
    window.addEventListener("open_cookie_preferences", handleReopen);
    return () => window.removeEventListener("open_cookie_preferences", handleReopen);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      window.dispatchEvent(new Event("cookie_preferences_changed"));
    } catch (e) {
      console.warn("Could not save cookie preferences", e);
    }
    setPreferences(prefs);
    applyGtagConsent(prefs);
    setManualOpen(false);
    setIsCustomizeOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      ...preferences,
      timestamp: Date.now(),
    });
  };

  // During SSR / hydrating, do not render modal
  if (rawConsent === "") return null;

  const isOpen = manualOpen || rawConsent === null;
  if (!isOpen) return null;

  return (
    <>
      {/* 1. Low-profile, Non-intrusive Bottom Banner */}
      {!isCustomizeOpen ? (
        <aside
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
          className="fixed bottom-0 inset-x-0 z-50 px-3 py-2 sm:px-6 sm:py-3 bg-[var(--header-bg)]/95 backdrop-blur-md border-t border-[var(--border-color)] shadow-2xl animate-fade-in"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[var(--badge-bg)] text-[var(--accent-primary)] shrink-0">
                <Cookie className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
              </div>
              <div className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-tight sm:leading-relaxed">
                <span id="cookie-banner-title" className="font-bold text-[var(--text-main)] mr-1">
                  Cookies & Privacy:
                </span>
                <span id="cookie-banner-description">
                  We use strictly necessary storage for workspace sync and optional analytics. Read our{" "}
                  <Link href="/cookies" className="text-[var(--accent-primary)] underline hover:text-[var(--text-main)]">
                    Cookie Policy
                  </Link>.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(true)}
                className="px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      ) : (
        /* 2. Granular Preferences Centered Modal */
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div className="max-w-2xl w-full bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />
                <h2 id="cookie-preferences-title" className="font-bold text-sm sm:text-base text-[var(--text-main)]">
                  Manage Cookie & Tracking Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                aria-label="Close customization modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)]">Strictly Necessary</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--accent-primary)]">
                    Always Active
                  </span>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Required for core workspace synchronization, JWT password gate verification, and theme preference persistence.
                </p>
              </div>

              {/* Category 2: Analytics Cookies */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)]">Performance & Analytics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Toggle analytics cookies"
                    />
                    <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Aggregated, anonymized visit counts and traffic sources via Google Analytics 4 with IP anonymization enabled.
                </p>
              </div>

              {/* Category 3: Advertising / Marketing */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)]">Advertising & Partner</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Toggle advertising cookies"
                    />
                    <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Permits Google AdSense cookies on editorial guide and article pages to serve relevant non-intrusive ads.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-[var(--text-muted)]">
                You can change these preferences at any time via the &quot;Cookie Preferences&quot; link in the footer.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-main)] cursor-pointer"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Utility button for page footers to allow users to trigger
 * the cookie consent modal anytime (GDPR & DPDP requirement).
 */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open_cookie_preferences"));
        }
      }}
      className="hover:text-[var(--text-main)] transition-colors underline cursor-pointer text-left"
    >
      Cookie Preferences
    </button>
  );
}
