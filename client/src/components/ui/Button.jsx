import { Loader2 } from "lucide-react";
import React from 'react'
const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600",
  danger: "bg-white text-red-600 hover:bg-red-50 border-red-200 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800"
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
