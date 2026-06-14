import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import Button from "../ui/Button.jsx";
import { fetchReadme } from "../../services/api.js";
import { FileCode2, RefreshCw, Download } from "lucide-react";
import React from "react";

export default function ReadmePanel({ projectId, readme, onRefresh }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!readme && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      fetchReadme(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [projectId, readme, getToken, onRefresh]);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetchReadme(projectId, getToken);
      toast.success("README regenerated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!readme) return;
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("README downloaded!");
  }

  if (loading) return <Spinner label="Generating README..." />;

  if (!readme) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <FileCode2 className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No README Generated Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate a complete professional README.md with project overview, features, tech stack, installation, and more.
        </p>
        <Button className="mt-4" onClick={handleRegenerate}>
          <FileCode2 className="h-4 w-4" />
          Generate README
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">Complete README generated</p>
        <div className="flex gap-2">
          <CopyButton text={readme} label="Copy" />
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download .md
          </Button>
          <Button variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {readme}
          </pre>
        </div>
      </Card>
    </div>
  );
}
