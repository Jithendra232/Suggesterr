import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { getProjects } from "../services/api.js";
import { GitCompareArrows } from "lucide-react";
import React from "react";

const comparisonFields = [
  { label: "Complexity Score", key: "complexityScore", format: (v) => v ?? "N/A" },
  { label: "Difficulty", key: "difficulty" },
  { label: "Domain", key: "domain" },
  { label: "Estimated Time", key: "estimatedTime" },
  { label: "Features Count", key: "features", format: (v) => Array.isArray(v) ? v.length : 0 },
  { label: "Tech Stack Count", key: "techStack", format: (v) => Array.isArray(v) ? v.length : 0 },
  { label: "API Endpoints Count", key: "apiEndpoints", format: (v) => Array.isArray(v) ? v.length : 0 },
  { label: "Database Collections", key: "databaseSchema", format: (v) => Array.isArray(v) ? v.length : 0 },
  { label: "Resume Points", key: "resumePoints", format: (v) => Array.isArray(v) ? v.length : 0 },
  { label: "Source", key: "source" },
];

function ComparisonRow({ label, valueA, valueB }) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700">
      <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</td>
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{valueA}</td>
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{valueB}</td>
    </tr>
  );
}

export default function ComparePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectAId, setProjectAId] = useState("");
  const [projectBId, setProjectBId] = useState("");

  const load = useCallback(async () => {
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
    load();
  }, [isLoaded, isSignedIn, load]);

  if (loading || !isLoaded) return <Spinner label="Loading projects" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const projectA = projects.find(p => p._id === projectAId);
  const projectB = projects.find(p => p._id === projectBId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compare Projects</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Select two projects to compare side by side.</p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Project A</label>
            <select value={projectAId} onChange={(e) => setProjectAId(e.target.value)} className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option value="">Select a project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Project B</label>
            <select value={projectBId} onChange={(e) => setProjectBId(e.target.value)} className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option value="">Select a project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {projectA && projectB ? (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Metric</div>
              <div className="truncate text-sm font-bold text-indigo-700 dark:text-indigo-400">{projectA.title}</div>
              <div className="truncate text-sm font-bold text-purple-700 dark:text-purple-400">{projectB.title}</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {comparisonFields.map(({ label, key, format }) => {
                  const valA = format ? format(projectA[key]) : (projectA[key] ?? "N/A");
                  const valB = format ? format(projectB[key]) : (projectB[key] ?? "N/A");
                  return <ComparisonRow key={key} label={label} valueA={String(valA)} valueB={String(valB)} />;
                })}
                <ComparisonRow label="Tech Stack" valueA={projectA.techStack?.join(", ") || "N/A"} valueB={projectB.techStack?.join(", ") || "N/A"} />
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
          <GitCompareArrows className="mb-3 h-8 w-8 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Select two projects to compare</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">Choose a project for each slot above to see a side-by-side comparison.</p>
        </div>
      )}
    </div>
  );
}
