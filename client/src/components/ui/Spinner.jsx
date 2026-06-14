import { Loader2 } from "lucide-react";
import React from 'react'

export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      {label}
    </div>
  );
}
