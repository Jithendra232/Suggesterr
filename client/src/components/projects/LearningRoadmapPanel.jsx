import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import Spinner from "../ui/Spinner.jsx";
import { fetchLearningRoadmap, generateLearningRoadmap, updateLearningProgress } from "../../services/api.js";
import { GraduationCap, RefreshCw, Clock, CheckCircle2, Circle, BarChart3 } from "lucide-react";
import React from "react";

const sectionColors = {
  Prerequisites: "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "Frontend Topics": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  "Backend Topics": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "Database Topics": "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "Deployment Topics": "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
};

export default function LearningRoadmapPanel({ projectId, learningRoadmap, onRefresh }) {
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [updatingIdx, setUpdatingIdx] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if ((!learningRoadmap || !learningRoadmap.sections?.length) && !fetchedRef.current) {
      fetchedRef.current = true;
      setAutoLoading(true);
      fetchLearningRoadmap(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load roadmap"))
        .finally(() => setAutoLoading(false));
    }
  }, [projectId, learningRoadmap, getToken, onRefresh]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateLearningRoadmap(projectId, getToken);
      toast.success("Learning roadmap generated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(sectionIndex, topicIndex, currentCompleted) {
    const key = `${sectionIndex}-${topicIndex}`;
    setUpdatingIdx(key);
    try {
      await updateLearningProgress(projectId, sectionIndex, topicIndex, !currentCompleted, getToken);
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to update progress");
    } finally {
      setUpdatingIdx(null);
    }
  }

  if (generating || autoLoading) return <Spinner label="Generating learning roadmap with AI..." />;

  if (!learningRoadmap || !learningRoadmap.sections?.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <GraduationCap className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Learning Roadmap Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate a personalized learning roadmap with prerequisites, topics, estimated hours, and a progress tracker.
        </p>
        <Button className="mt-4" onClick={handleGenerate}>
          <GraduationCap className="h-4 w-4" />
          Generate Roadmap
        </Button>
      </div>
    );
  }

  const { sections, totalEstimatedHours } = learningRoadmap;
  const allTopics = sections.flatMap((s) => s.topics || []);
  const completedCount = allTopics.filter((t) => t.completed).length;
  const totalCount = allTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={handleGenerate}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Progress</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {completedCount} of {totalCount} topics completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            {totalEstimatedHours && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-900/50">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{totalEstimatedHours}h estimated</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/50">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{progressPercent}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Sections */}
      {sections.map((section, sIdx) => {
        const sectionCompleted = (section.topics || []).filter((t) => t.completed).length;
        const sectionTotal = (section.topics || []).length;
        const colorClass = sectionColors[section.title] || "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

        return (
          <Card key={sIdx} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${colorClass}`}>
                  {sectionCompleted}/{sectionTotal}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              {section.estimatedHours && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">~{section.estimatedHours}h</span>
              )}
            </div>

            <div className="space-y-2">
              {(section.topics || []).map((topic, tIdx) => {
                const key = `${sIdx}-${tIdx}`;
                const isUpdating = updatingIdx === key;

                return (
                  <button
                    key={tIdx}
                    onClick={() => handleToggle(sIdx, tIdx, topic.completed)}
                    disabled={isUpdating}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                      topic.completed
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30"
                        : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
                    }`}
                  >
                    {topic.completed ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-slate-400" />
                    )}
                    <span className={`text-sm ${topic.completed ? "text-emerald-800 line-through dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
                      {topic.title || topic}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
