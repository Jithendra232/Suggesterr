import { Link } from "react-router-dom";
import { Home, FolderOpen, FileQuestion } from "lucide-react";
import React from "react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="text-center">
        <FileQuestion className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
        <p className="mt-6 text-7xl font-extrabold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
          The page, project, or report you are looking for does not exist.
          It may have been removed, renamed, or the link may be incorrect.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FolderOpen className="h-4 w-4" />
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
