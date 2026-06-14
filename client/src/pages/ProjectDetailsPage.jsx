import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Trash2, Share2, GitBranch, Copy, Check, Plus, BookOpen, FileText, Github, GraduationCap, Briefcase } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProjectDetails from "../components/projects/ProjectDetails.jsx";
import InterviewQuestionsPanel from "../components/projects/InterviewQuestionsPanel.jsx";
import DocumentationPanel from "../components/projects/DocumentationPanel.jsx";
import GitHubPlannerPanel from "../components/projects/GitHubPlannerPanel.jsx";
import LearningRoadmapPanel from "../components/projects/LearningRoadmapPanel.jsx";
import RecruiterAnalysisPanel from "../components/projects/RecruiterAnalysisPanel.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { ProjectDetailsSkeleton } from "../components/ui/SkeletonLoader.jsx";
import { deleteProject, getProject, getProjectVersions, createProjectVersion, generateShareLink } from "../services/api.js";
import React from "react";

const aiTabs = [
  { id: "interview", label: "Interview Q&A", icon: BookOpen },
  { id: "docs", label: "Documentation", icon: FileText },
  { id: "github", label: "GitHub Planner", icon: Github },
  { id: "roadmap", label: "Learning Roadmap", icon: GraduationCap },
  { id: "recruiter", label: "Recruiter Mode", icon: Briefcase },
];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Versioning state
  const [versions, setVersions] = useState([]);
  const [creatingVersion, setCreatingVersion] = useState(false);

  // Share state
  const [shareLink, setShareLink] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI tab state
  const [activeTab, setActiveTab] = useState("interview");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProject(id, getToken);
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, id]);

  const loadVersions = useCallback(async () => {
    try {
      const data = await getProjectVersions(id, getToken);
      setVersions(data.versions || []);
    } catch {
      // silently fail - versions are optional
    }
  }, [getToken, id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadProject();
    loadVersions();
  }, [isLoaded, isSignedIn, loadProject, loadVersions]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(id, getToken);
      toast.success("Project deleted");
      navigate("/history");
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  async function handleNewVersion() {
    setCreatingVersion(true);
    try {
      const data = await createProjectVersion(id, getToken);
      toast.success(`Version ${data.project.versionNumber} created!`);
      navigate(`/history/${data.project._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create new version");
      setCreatingVersion(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const data = await generateShareLink(id, getToken);
      const link = `${window.location.origin}/share/${data.shareId}`;
      setShareLink(link);
      toast.success("Share link generated!");
    } catch (err) {
      toast.error(err.message || "Failed to generate share link");
    } finally {
      setSharing(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || !isLoaded) return <ProjectDetailsSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadProject} />;

  return (
    <div className="space-y-5">
      {/* Top Navigation */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={sharing} onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="secondary" loading={creatingVersion} onClick={handleNewVersion}>
            <Plus className="h-4 w-4" />
            New Version
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Share Link */}
      {shareLink && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/30">
          <Share2 className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
          <input
            type="text"
            readOnly
            value={shareLink}
            className="min-w-0 flex-1 rounded border border-indigo-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-indigo-700 dark:bg-slate-800 dark:text-slate-300"
          />
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Version Selector */}
      {versions.length > 1 && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <GitBranch className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Version:</span>
          <select
            value={project._id}
            onChange={(e) => navigate(`/history/${e.target.value}`)}
            className="focus-ring min-h-8 rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {versions.map((v) => (
              <option key={v._id} value={v._id}>
                v{v.versionNumber} — {v.title} ({v.source})
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {versions.length} version{versions.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Core Project Details (existing component) */}
      <ProjectDetails project={project} />

      {/* AI Features Tabs */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          {aiTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === "interview" && (
            <InterviewQuestionsPanel
              projectId={project._id}
              interviewQuestions={project.interviewQuestions}
              onRefresh={loadProject}
            />
          )}
          {activeTab === "docs" && (
            <DocumentationPanel
              projectId={project._id}
              documentation={project.documentation}
              onRefresh={loadProject}
            />
          )}
          {activeTab === "github" && (
            <GitHubPlannerPanel
              projectId={project._id}
              githubPlanner={project.githubPlanner}
              onRefresh={loadProject}
            />
          )}
          {activeTab === "roadmap" && (
            <LearningRoadmapPanel
              projectId={project._id}
              learningRoadmap={project.learningRoadmap}
              onRefresh={loadProject}
            />
          )}
          {activeTab === "recruiter" && (
            <RecruiterAnalysisPanel
              projectId={project._id}
              recruiterAnalysis={project.recruiterAnalysis}
              onRefresh={loadProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
