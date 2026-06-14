import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchResumeDescription } from "../../services/api.js";
import { FileEdit, RefreshCw } from "lucide-react";
import React from "react";

const sectionLabels = {
  fiftyWords: "50-Word Version",
  hundredWords: "100-Word Version",
  atsFriendly: "ATS-Friendly Version",
  oneLine: "One-Line Resume Bullet",
};

const sectionIcons = {
  fiftyWords: "📝",
  hundredWords: "📋",
  atsFriendly: "🎯",
  oneLine: "⚡",
};

export default function ResumeDescriptionPanel({ projectId, resumeDescription, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!resumeDescription && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchResumeDescription(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, resumeDescription, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchResumeDescription(projectId, getToken);
      toast.success("Resume descriptions refreshed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner label="Generating resume descriptions..." />;

  if (!resumeDescription) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <FileEdit className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Resume Description Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate resume-ready descriptions in 50-word, 100-word, ATS-friendly, and one-line versions.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <FileEdit className="h-4 w-4" />
          Generate Descriptions
        </Button>
      </div>
    );
  }

  const allText = Object.entries(resumeDescription)
    .filter(([, v]) => v)
    .map(([k, v]) => `## ${sectionLabels[k] || k}\n${v}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">4 resume versions generated</p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(resumeDescription)
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
