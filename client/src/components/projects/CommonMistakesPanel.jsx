import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchCommonMistakes } from "../../services/api.js";
import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";

const sectionLabels = {
  design: "Design Mistakes",
  database: "Database Mistakes",
  authentication: "Authentication Mistakes",
  deployment: "Deployment Mistakes",
  resume: "Resume Mistakes",
};

const sectionColors = {
  design: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  database: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20",
  authentication: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
  deployment: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",
  resume: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
};

export default function CommonMistakesPanel({ projectId, commonMistakes, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!commonMistakes && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchCommonMistakes(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, commonMistakes, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchCommonMistakes(projectId, getToken);
      toast.success("Common mistakes refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating common mistakes..." />;

  if (!commonMistakes) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <AlertTriangle className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Common Mistakes Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate project-specific common mistakes to avoid in design, database, auth, deployment, and resume.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <AlertTriangle className="h-4 w-4" />
          Generate Mistakes
        </Button>
      </div>
    );
  }

  const allText = Object.entries(commonMistakes)
    .filter(([, v]) => Array.isArray(v) && v.length > 0)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v.map(i => `• ${i}`).join("\n")}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">5 mistake categories analyzed</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(commonMistakes)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([key, items]) => (
          <Card key={key} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sectionLabels[key] || key}
              </h3>
              <CopyButton text={items.map(i => `• ${i}`).join("\n")} label="Copy" />
            </div>
            <ul className={`space-y-2 rounded-lg border p-4 ${sectionColors[key] || ""}`}>
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 text-red-500">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </div>
  );
}
