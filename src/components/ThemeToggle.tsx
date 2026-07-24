"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)]" />;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-main)] hover:opacity-80 transition-all duration-200 shadow-sm cursor-pointer"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[var(--accent-indigo)]" />}
    </button>
  );
}
