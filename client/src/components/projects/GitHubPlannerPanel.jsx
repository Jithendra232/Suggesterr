import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import { fetchGitHubPlanner, generateGitHubPlanner } from "../../services/api.js";
import { Github, RefreshCw, FolderTree, GitCommit, Flag, AlertCircle, Tag, Layout } from "lucide-react";
import React from "react";

function PlannerSection({ title, icon: Icon, children, copyText }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        {copyText && <CopyButton text={copyText} label="Copy" />}
      </div>
      {children}
    </Card>
  );
}

export default function GitHubPlannerPanel({ projectId, githubPlanner, onRefresh }) {
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if ((!githubPlanner || !githubPlanner.readme) && !fetchedRef.current) {
      fetchedRef.current = true;
      setAutoLoading(true);
      fetchGitHubPlanner(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load GitHub planner"))
        .finally(() => setAutoLoading(false));
    }
  }, [projectId, githubPlanner, getToken, onRefresh]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateGitHubPlanner(projectId, getToken);
      toast.success("GitHub planner generated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate GitHub planner");
    } finally {
      setGenerating(false);
    }
  }

  if (generating || autoLoading) return <Spinner label="Generating GitHub planner with AI..." />;

  if (!githubPlanner || Object.keys(githubPlanner).length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <Github className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No GitHub Planner Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate a complete GitHub repository plan with README, folder structure, commit plan, milestones, issues, and labels.
        </p>
        <Button className="mt-4" onClick={handleGenerate}>
          <Github className="h-4 w-4" />
          Generate GitHub Planner
        </Button>
      </div>
    );
  }

  const p = githubPlanner;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">GitHub-ready repository plan</p>
        <Button variant="secondary" onClick={handleGenerate}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      {/* README */}
      {p.readme && (
        <PlannerSection title="Repository README" icon={FolderTree} copyText={p.readme}>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{p.readme}</pre>
          </div>
        </PlannerSection>
      )}

      {/* Folder Structure */}
      {p.folderStructure && (
        <PlannerSection title="Folder Structure" icon={FolderTree} copyText={Array.isArray(p.folderStructure) ? p.folderStructure.join("\n") : p.folderStructure}>
          <div className="rounded-lg bg-slate-50 p-4 font-mono text-sm dark:bg-slate-800">
            {(Array.isArray(p.folderStructure) ? p.folderStructure : [p.folderStructure]).map((item, idx) => (
              <div key={idx} className="py-0.5 text-slate-700 dark:text-slate-300">{item}</div>
            ))}
          </div>
        </PlannerSection>
      )}

      {/* Commit Plan */}
      {p.commitPlan?.length > 0 && (
        <PlannerSection title="Commit Plan" icon={GitCommit} copyText={p.commitPlan.map((c, i) => `${i + 1}. ${c.message || c}`).join("\n")}>
          <div className="space-y-2">
            {p.commitPlan.map((commit, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">#{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{commit.message || commit}</p>
                  {commit.description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{commit.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </PlannerSection>
      )}

      {/* Milestones */}
      {p.milestones?.length > 0 && (
        <PlannerSection title="Milestones" icon={Flag} copyText={p.milestones.map((m, i) => `${i + 1}. ${m.title || m}`).join("\n")}>
          <div className="space-y-2">
            {p.milestones.map((milestone, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">{milestone.title || milestone}</p>
                {milestone.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{milestone.description}</p>}
              </div>
            ))}
          </div>
        </PlannerSection>
      )}

      {/* Issues */}
      {p.issues?.length > 0 && (
        <PlannerSection title="Suggested Issues" icon={AlertCircle} copyText={p.issues.map((iss, i) => `${i + 1}. [${iss.labels?.join(", ") || "none"}] ${iss.title || iss}`).join("\n")}>
          <div className="space-y-2">
            {p.issues.map((issue, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">{issue.title || issue}</p>
                {issue.labels?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {issue.labels.map((label, lIdx) => (
                      <span key={lIdx} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PlannerSection>
      )}

      {/* Labels */}
      {p.labels?.length > 0 && (
        <PlannerSection title="Repository Labels" icon={Tag}>
          <div className="flex flex-wrap gap-2">
            {p.labels.map((label, idx) => (
              <span key={idx} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {label.name || label}
              </span>
            ))}
          </div>
        </PlannerSection>
      )}

      {/* Project Board */}
      {p.projectBoard && (
        <PlannerSection title="Project Board Plan" icon={Layout} copyText={typeof p.projectBoard === "string" ? p.projectBoard : JSON.stringify(p.projectBoard, null, 2)}>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {typeof p.projectBoard === "string" ? p.projectBoard : JSON.stringify(p.projectBoard, null, 2)}
            </pre>
          </div>
        </PlannerSection>
      )}
    </div>
  );
}
