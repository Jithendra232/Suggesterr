import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import { fetchProjectDescription } from "../../services/api.js";
import { FileText, RefreshCw } from "lucide-react";
import Button from "../ui/Button.jsx";
import React from "react";

const sectionLabels = {
  professional: "Professional Summary",
  beginner: "Beginner-Friendly Explanation",
  recruiter: "Recruiter-Friendly Description",
};

const sectionIcons = {
  professional: "💼",
  beginner: "🌱",
  recruiter: "🎯",
};

export default function ProjectDescriptionPanel({ projectId, projectDescription, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!projectDescription && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchProjectDescription(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load description"))
        .finally(() => setLoading(false));
    }
  }, [projectId, projectDescription, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchProjectDescription(projectId, getToken);
      toast.success("Project description refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating project descriptions..." />;

  if (!projectDescription) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <FileText className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Project Description Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate professional, beginner-friendly, and recruiter-friendly project descriptions.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <FileText className="h-4 w-4" />
          Generate Descriptions
        </Button>
      </div>
    );
  }

  const allText = Object.entries(projectDescription)
    .filter(([, v]) => v)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">3 description styles generated</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(projectDescription)
        .filter(([, v]) => v)
        .map(([key, content]) => (
          <Card key={key} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xl">{sectionIcons[key] || "📄"}</span>
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
