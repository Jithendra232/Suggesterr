import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import { fetchDocumentation, generateProjectDocumentation } from "../../services/api.js";
import { FileText, RefreshCw, Download } from "lucide-react";
import React from "react";

const sectionIcons = {
  readme: "📄",
  installationGuide: "🔧",
  projectOverview: "📋",
  architectureDocumentation: "🏗️",
  apiDocumentation: "🔌",
  databaseDocumentation: "💾",
};

const sectionLabels = {
  readme: "README.md",
  installationGuide: "Installation Guide",
  projectOverview: "Project Overview",
  architectureDocumentation: "Architecture",
  apiDocumentation: "API Documentation",
  databaseDocumentation: "Database Documentation",
};

export default function DocumentationPanel({ projectId, documentation, onRefresh }) {
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Lazy load on mount if not already generated
  useEffect(() => {
    if ((!documentation || !documentation.readme) && !fetchedRef.current) {
      fetchedRef.current = true;
      setAutoLoading(true);
      fetchDocumentation(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load documentation"))
        .finally(() => setAutoLoading(false));
    }
  }, [projectId, documentation, getToken, onRefresh]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateProjectDocumentation(projectId, getToken);
      toast.success("Documentation generated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate documentation");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!documentation) return;
    const allContent = Object.entries(documentation)
      .filter(([, val]) => val && typeof val === "string")
      .map(([key, val]) => `# ${sectionLabels[key] || key}\n\n${val}`)
      .join("\n\n---\n\n");

    const blob = new Blob([allContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-documentation.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Documentation downloaded!");
  }

  if (generating || autoLoading) return <Spinner label="Generating documentation with AI..." />;

  if (!documentation || Object.keys(documentation).length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <FileText className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Documentation Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate comprehensive documentation including README, installation guide, architecture, API, and database docs.
        </p>
        <Button className="mt-4" onClick={handleGenerate}>
          <FileText className="h-4 w-4" />
          Generate Documentation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {Object.keys(documentation).filter((k) => documentation[k]).length} sections generated
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="secondary" onClick={handleGenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {Object.entries(documentation)
        .filter(([, val]) => val && typeof val === "string")
        .map(([key, content]) => (
          <Card key={key} className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xl">{sectionIcons[key] || "📄"}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sectionLabels[key] || key}
              </h3>
              <CopyButton text={content} label="Copy" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {content}
              </pre>
            </div>
          </Card>
        ))}
    </div>
  );
}
