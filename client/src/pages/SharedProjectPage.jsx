import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProjectDetails from "../components/projects/ProjectDetails.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { ProjectDetailsSkeleton } from "../components/ui/SkeletonLoader.jsx";
import { getSharedProject } from "../services/api.js";
import { Share2, ArrowLeft } from "lucide-react";
import React from "react";

export default function SharedProjectPage() {
  const { shareId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSharedProject(shareId);
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ProjectDetailsSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md text-center">
          <ErrorState message={error} onRetry={load} />
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            <ArrowLeft className="h-4 w-4" />
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Public header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2">
              <Share2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-950 dark:text-white">AI Project Generator</span>
          </Link>
          <Link
            to="/"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try It Free
          </Link>
        </div>
      </header>

      {/* Shared badge */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/30">
          <Share2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            You are viewing a shared project — read-only
          </p>
        </div>
      </div>

      {/* Project content */}
      <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <ProjectDetails project={project} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generated with <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI Project Generator</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
