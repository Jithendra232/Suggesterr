import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchScalabilitySuggestions } from "../../services/api.js";
import { TrendingUp, RefreshCw } from "lucide-react";
import React from "react";

const sectionLabels = {
  currentLimitations: "Current Limitations",
  scalingChallenges: "Scaling Challenges",
  futureImprovements: "Future Architecture Improvements",
  largeUserStrategies: "Large-User Handling Strategies",
};

const sectionIcons = {
  currentLimitations: "🚧",
  scalingChallenges: "⚡",
  futureImprovements: "🚀",
  largeUserStrategies: "📈",
};

export default function ScalabilityPanel({ projectId, scalabilitySuggestions, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!scalabilitySuggestions && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchScalabilitySuggestions(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, scalabilitySuggestions, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchScalabilitySuggestions(projectId, getToken);
      toast.success("Scalability suggestions refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating scalability suggestions..." />;

  if (!scalabilitySuggestions) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <TrendingUp className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Scalability Suggestions Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Analyze current limitations and generate scaling strategies for this project.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <TrendingUp className="h-4 w-4" />
          Generate Suggestions
        </Button>
      </div>
    );
  }

  const allText = Object.entries(scalabilitySuggestions)
    .filter(([, v]) => Array.isArray(v) && v.length > 0)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v.map(i => `• ${i}`).join("\n")}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">4 scalability areas analyzed</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(scalabilitySuggestions)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([key, items]) => (
          <Card key={key} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xl">{sectionIcons[key] || "📊"}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sectionLabels[key] || key}
              </h3>
              <CopyButton text={items.map(i => `• ${i}`).join("\n")} label="Copy" />
            </div>
            <ul className="space-y-2">
              {items.map((item, idx) => (
                <li key={idx} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </div>
  );
}
