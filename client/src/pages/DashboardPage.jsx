import { useAuth, useUser } from "@clerk/clerk-react";
import { Bookmark, CalendarClock, Lightbulb } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ProjectCard from "../components/projects/ProjectCard.jsx";
import { getProjects } from "../services/api.js";
import React from 'react'

export default function DashboardPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const stats = useMemo(() => {
    const last = projects[0]?.createdAt ? new Date(projects[0].createdAt).toLocaleDateString() : "No projects yet";
    return [
      { label: "Total Projects Generated", value: projects.length, icon: Lightbulb },
      { label: "Saved Projects", value: projects.length, icon: Bookmark },
      { label: "Last Generated Date", value: last, icon: CalendarClock }
    ];
  }, [projects]);

  if (loading || !isLoaded) return <Spinner label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={loadProjects} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Welcome, {user?.firstName || user?.fullName || "student"}. Here is your project workspace.</p>
        </div>
        <Link to="/generator">
          <Button className="w-full sm:w-auto">Generate Project</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="rounded-md bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
          {projects.length > 0 ? (
            <Link to="/history" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all
            </Link>
          ) : null}
        </div>
        {projects.length === 0 ? (
          <EmptyState
            title="No projects generated yet"
            description="Create your first project idea from your skills, domain, and difficulty level."
            action={
              <Link to="/generator">
                <Button>Open Generator</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project._id} project={project} showActions={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
