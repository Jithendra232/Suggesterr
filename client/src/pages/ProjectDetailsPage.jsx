import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Trash2, Share2, GitBranch, Copy, Check, Plus, BookOpen, FileText, Github, GraduationCap, Briefcase, FileCode2, AlertTriangle, TrendingUp, Building2, FileEdit, Network, Percent, FileQuestion, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProjectDetails from "../components/projects/ProjectDetails.jsx";
import InterviewQuestionsPanel from "../components/projects/InterviewQuestionsPanel.jsx";
import DocumentationPanel from "../components/projects/DocumentationPanel.jsx";
import GitHubPlannerPanel from "../components/projects/GitHubPlannerPanel.jsx";
import LearningRoadmapPanel from "../components/projects/LearningRoadmapPanel.jsx";
import RecruiterAnalysisPanel from "../components/projects/RecruiterAnalysisPanel.jsx";
import ProjectDescriptionPanel from "../components/projects/ProjectDescriptionPanel.jsx";
import CommonMistakesPanel from "../components/projects/CommonMistakesPanel.jsx";
import ScalabilityPanel from "../components/projects/ScalabilityPanel.jsx";
import IndustryImprovementsPanel from "../components/projects/IndustryImprovementsPanel.jsx";
import ReadmePanel from "../components/projects/ReadmePanel.jsx";
import ResumeDescriptionPanel from "../components/projects/ResumeDescriptionPanel.jsx";
import ArchitectureExplanationPanel from "../components/projects/ArchitectureExplanationPanel.jsx";
import AIMentorPanel from "../components/projects/AIMentorPanel.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { ProjectDetailsSkeleton } from "../components/ui/SkeletonLoader.jsx";
import { deleteProject, getProject, getProjectVersions, createProjectVersion, generateShareLink, updateProjectProgress } from "../services/api.js";
import React from "react";

const aiTabs = [
  { id: "interview", label: "Interview Q&A", icon: BookOpen },
  { id: "docs", label: "Documentation", icon: FileText },
  { id: "github", label: "GitHub Planner", icon: Github },
  { id: "roadmap", label: "Learning Roadmap", icon: GraduationCap },
  { id: "recruiter", label: "Recruiter Mode", icon: Briefcase },
  { id: "description", label: "Descriptions", icon: FileEdit },
  { id: "mistakes", label: "Common Mistakes", icon: AlertTriangle },
  { id: "scalability", label: "Scalability", icon: TrendingUp },
  { id: "industry", label: "Industry", icon: Building2 },
  { id: "readme", label: "README", icon: FileCode2 },
  { id: "resume", label: "Resume Desc", icon: FileText },
  { id: "archExplain", label: "Arch Explain", icon: Network },
  { id: "mentor", label: "AI Mentor", icon: MessageCircle },
];

// Tabs hidden for reverse-engineered products.
// Real-world products (Uber, Netflix, etc.) should only show system-design-relevant tabs.
// Hidden: Interview Q&A, GitHub Planner, Learning Roadmap, Recruiter Mode,
//         Descriptions (project description / alternatives), Resume Desc, Common Mistakes.
// Visible: Documentation, Scalability, Industry, README, Arch Explain, AI Mentor.
const reverseEngineeredHiddenTabs = new Set([
  "interview",    // Interview Questions  — student-project feature
  "github",       // GitHub Planner       — student-project feature
  "roadmap",      // Learning Roadmap     — student-project feature
  "recruiter",    // Recruiter Analysis   — student-project feature
  "description",  // Project Descriptions — includes alternative project ideas
  "resume",       // Resume Description   — not applicable to real products
  "mistakes",     // Common Mistakes      — student-project feature
]);

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

  // Derive visible tabs based on sourceType
  const visibleTabs = project?.sourceType === "reverse_engineered"
    ? aiTabs.filter((tab) => !reverseEngineeredHiddenTabs.has(tab.id))
    : aiTabs;

  // Reset activeTab if current tab becomes hidden
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  // Progress tracking state
  const [progressStatus, setProgressStatus] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  const loadProject = useCallback(async (silent = false) => {
    if (!isLoaded || !isSignedIn) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await getProject(id, getToken);
      setProject(data.project);
    } catch (err) {
      if (err.isAuthInitError) return;
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn, id]);

  // Silent refresh — preserves scroll position by NOT triggering the skeleton
  const handleRefresh = useCallback(() => loadProject(true), [loadProject]);

  const loadVersions = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const data = await getProjectVersions(id, getToken);
      setVersions(data.versions || []);
    } catch {
      // silently fail - versions are optional
    }
  }, [getToken, isLoaded, isSignedIn, id]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setError("Please sign in to view this project.");
      setLoading(false);
      return;
    }
    loadProject();
    loadVersions();
  }, [isLoaded, isSignedIn, loadProject, loadVersions]);

  // Sync progress state from project
  useEffect(() => {
    if (project) {
      setProgressStatus(project.progressStatus || "not_started");
      setProgressPercent(project.progressPercent || 0);
    }
  }, [project]);

  async function handleProgressUpdate(newStatus, newPercent) {
    if (!project?._id) return;
    setSavingProgress(true);
    try {
      await updateProjectProgress(project._id, newStatus, newPercent, getToken);
      setProgressStatus(newStatus);
      setProgressPercent(newPercent);
      toast.success("Progress updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update progress");
    } finally {
      setSavingProgress(false);
    }
  }

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
  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileQuestion className="mb-4 h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          This project doesn't exist or you don't have permission to view it.
        </p>
        <Link
          to="/history"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
      </div>
    );
  }

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

      {/* Progress Tracking */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Progress</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={progressStatus}
              onChange={(e) => {
                const newStatus = e.target.value;
                const autoPercent = newStatus === "completed" ? 100 : newStatus === "not_started" ? 0 : progressPercent;
                handleProgressUpdate(newStatus, autoPercent);
              }}
              disabled={savingProgress}
              className="focus-ring min-h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                onMouseUp={(e) => handleProgressUpdate(progressStatus, Number(e.target.value))}
                disabled={savingProgress}
                className="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
              />
              <span className="min-w-10 text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-3 rounded-full transition-all ${
              progressPercent === 100
                ? "bg-emerald-500"
                : progressPercent > 0
                ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* AI Features Tabs */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          {visibleTabs.map((tab) => {
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
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "docs" && (
            <DocumentationPanel
              projectId={project._id}
              documentation={project.documentation}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "github" && (
            <GitHubPlannerPanel
              projectId={project._id}
              githubPlanner={project.githubPlanner}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "roadmap" && (
            <LearningRoadmapPanel
              projectId={project._id}
              learningRoadmap={project.learningRoadmap}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "recruiter" && (
            <RecruiterAnalysisPanel
              projectId={project._id}
              recruiterAnalysis={project.recruiterAnalysis}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "description" && (
            <ProjectDescriptionPanel
              projectId={project._id}
              projectDescription={project.projectDescription}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "mistakes" && (
            <CommonMistakesPanel
              projectId={project._id}
              commonMistakes={project.commonMistakes}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "scalability" && (
            <ScalabilityPanel
              projectId={project._id}
              scalabilitySuggestions={project.scalabilitySuggestions}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "industry" && (
            <IndustryImprovementsPanel
              projectId={project._id}
              industryImprovements={project.industryImprovements}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "readme" && (
            <ReadmePanel
              projectId={project._id}
              readme={project.readme}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "resume" && (
            <ResumeDescriptionPanel
              projectId={project._id}
              resumeDescription={project.resumeDescription}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "archExplain" && (
            <ArchitectureExplanationPanel
              projectId={project._id}
              architectureExplanation={project.architectureExplanation}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "mentor" && (
            <AIMentorPanel projectId={project._id} />
          )}
        </div>
      </div>
    </div>
  );
}
