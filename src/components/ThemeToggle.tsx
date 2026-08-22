"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] shrink-0" />;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center shrink-0 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:opacity-80 transition-all duration-200 shadow-sm cursor-pointer"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[var(--accent-indigo)]" />}
    </button>
  );
}
