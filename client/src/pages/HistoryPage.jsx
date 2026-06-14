import { useAuth } from "@clerk/clerk-react";
import { ArrowDownAZ, ArrowUpAZ, Clock, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { ProjectCardSkeleton } from "../components/ui/SkeletonLoader.jsx";
import ProjectCard from "../components/projects/ProjectCard.jsx";
import { DIFFICULTIES, DOMAINS } from "../config/constants.js";
import { deleteProject, getProjects } from "../services/api.js";
import React from 'react'

export default function HistoryPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("newest");
  const [deletingId, setDeletingId] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProjects(getToken);
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadProjects();
  }, [isLoaded, isSignedIn, loadProjects]);

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();
    let result = projects.filter((project) => {
      const matchesSearch =
        !search ||
        project.title.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search) ||
        project.skills.some((skill) => skill.toLowerCase().includes(search));
      const matchesDomain = !domain || project.domain === domain;
      const matchesDifficulty = !difficulty || project.difficulty === difficulty;
      return matchesSearch && matchesDomain && matchesDifficulty;
    });

    switch (sort) {
      case "oldest":
        result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "alpha":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alpha-desc":
        result = [...result].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [projects, query, domain, difficulty, sort]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteProject(id, getToken);
      setProjects((current) => current.filter((project) => project._id !== id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId("");
    }
  }

  if (loading || !isLoaded) return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <ProjectCardSkeleton />
      <ProjectCardSkeleton />
      <ProjectCardSkeleton />
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={loadProjects} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">History</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Search, filter, sort, view, and delete generated project ideas.</p>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[1fr_200px_200px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects or skills"
            className="focus-ring min-h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <select value={domain} onChange={(event) => setDomain(event.target.value)} className="focus-ring min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="">All domains</option>
          {DOMAINS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="focus-ring min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="">All difficulties</option>
          {DIFFICULTIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">A-Z</option>
          <option value="alpha-desc">Z-A</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No saved projects" description="Generate a project to start building your history." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match your filters"
          description="Adjust your search, domain, or difficulty filters to find more results."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setDomain("");
                setDifficulty("");
                setSort("newest");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} onDelete={handleDelete} deleting={deletingId === project._id} />
          ))}
        </div>
      )}
    </div>
  );
}
