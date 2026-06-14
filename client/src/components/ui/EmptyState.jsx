import { FileText } from "lucide-react";
import React from 'react'

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
      <div className="mb-4 rounded-full bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
