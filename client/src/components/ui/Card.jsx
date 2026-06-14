import React from 'react'
export default function Card({ children, className = "" }) {
  return <div className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>{children}</div>;
}
