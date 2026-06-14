import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchArchitectureExplanation } from "../../services/api.js";
import { Network, RefreshCw } from "lucide-react";
import React from "react";

const sectionLabels = {
  frontend: "Frontend Architecture",
  backend: "Backend Architecture",
  database: "Database Design",
  authentication: "Authentication & Authorization",
  dataFlow: "Data Flow",
};

const sectionIcons = {
  frontend: "🖥️",
  backend: "⚙️",
  database: "💾",
  authentication: "🔐",
  dataFlow: "🔄",
};

export default function ArchitectureExplanationPanel({ projectId, architectureExplanation, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!architectureExplanation && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchArchitectureExplanation(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, architectureExplanation, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchArchitectureExplanation(projectId, getToken);
      toast.success("Architecture explanation refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating architecture explanation..." />;

  if (!architectureExplanation) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <Network className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Architecture Explanation Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate detailed explanations of frontend, backend, database, authentication, and data flow architecture.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <Network className="h-4 w-4" />
          Generate Explanation
        </Button>
      </div>
    );
  }

  const allText = Object.entries(architectureExplanation)
    .filter(([, v]) => v)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">5 architecture areas explained</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(architectureExplanation)
        .filter(([, v]) => v)
        .map(([key, content]) => (
          <Card key={key} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xl">{sectionIcons[key] || "🏗️"}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sectionLabels[key] || key}
              </h3>
              <CopyButton text={content} label="Copy" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {content}
              </p>
            </div>
          </Card>
        ))}
    </div>
  );
}
