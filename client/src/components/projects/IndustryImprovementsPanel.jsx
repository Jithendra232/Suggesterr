import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchIndustryImprovements } from "../../services/api.js";
import { Building2, RefreshCw } from "lucide-react";
import React from "react";

const sectionLabels = {
  enterpriseFeatures: "Enterprise Features",
  securityImprovements: "Security Improvements",
  monitoringLogging: "Monitoring & Logging",
  cicdRecommendations: "CI/CD Recommendations",
  productionEnhancements: "Production Enhancements",
};

const sectionIcons = {
  enterpriseFeatures: "🏢",
  securityImprovements: "🔒",
  monitoringLogging: "📊",
  cicdRecommendations: "🔄",
  productionEnhancements: "⚙️",
};

export default function IndustryImprovementsPanel({ projectId, industryImprovements, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!industryImprovements && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchIndustryImprovements(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, industryImprovements, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchIndustryImprovements(projectId, getToken);
      toast.success("Industry improvements refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating industry improvements..." />;

  if (!industryImprovements) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <Building2 className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Industry Improvements Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate enterprise features, security, monitoring, CI/CD, and production improvements.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <Building2 className="h-4 w-4" />
          Generate Improvements
        </Button>
      </div>
    );
  }

  const allText = Object.entries(industryImprovements)
    .filter(([, v]) => Array.isArray(v) && v.length > 0)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v.map(i => `• ${i}`).join("\n")}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">5 improvement areas generated</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(industryImprovements)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([key, items]) => (
          <Card key={key} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xl">{sectionIcons[key] || "💡"}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sectionLabels[key] || key}
              </h3>
              <CopyButton text={items.map(i => `• ${i}`).join("\n")} label="Copy" />
            </div>
            <ul className="space-y-2">
              {items.map((item, idx) => (
                <li key={idx} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  💡 {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </div>
  );
}
