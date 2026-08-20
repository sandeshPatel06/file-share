"use client";
import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glow" | "ghost" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97] cursor-pointer";

  const sizes = {
    xs: "px-2.5 py-1 text-[11px] gap-1 rounded-lg",
    sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-4.5 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3.5 text-base gap-2.5 rounded-2xl",
    xl: "px-8 py-4 text-lg gap-3 rounded-2xl font-bold",
  };

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border border-emerald-500/30",
    glow:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border border-emerald-500/30",
    secondary:
      "bg-[var(--badge-bg)] text-[var(--text-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] shadow-sm",
    ghost:
      "bg-transparent text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 border border-transparent",
    outline:
      "bg-transparent border border-[var(--border-color)] text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5",
    danger:
      "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] hover:opacity-90 shadow-sm",
    success:
      "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] hover:opacity-90 shadow-sm",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "xs" ? 12 : size === "sm" ? 14 : size === "xl" ? 22 : 16} className="animate-spin text-current shrink-0" />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
}
