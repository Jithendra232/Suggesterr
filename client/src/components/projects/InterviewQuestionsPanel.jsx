import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import CopyButton from "../ui/CopyButton.jsx";
import Spinner from "../ui/Spinner.jsx";
import { generateInterviewQuestions } from "../../services/api.js";
import { BookOpen, Code2, Database, Layers, Building2, RefreshCw } from "lucide-react";
import React from "react";

const categoryIcons = {
  "HR Questions": BookOpen,
  "Technical Questions": Code2,
  "Follow-up Questions": Database,
  "Project Defense Questions": Layers,
  "Database Questions": Database,
  "System Design Questions": Layers,
  "Architecture Questions": Building2,
};

const categoryColors = {
  "HR Questions": "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "Technical Questions": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "Follow-up Questions": "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "Project Defense Questions": "bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  "Database Questions": "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "System Design Questions": "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  "Architecture Questions": "bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

export default function InterviewQuestionsPanel({ projectId, interviewQuestions, onRefresh }) {
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateInterviewQuestions(projectId, getToken);
      toast.success("Interview questions generated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  }

  if (generating) return <Spinner label="Generating interview questions with AI..." />;

  if (!interviewQuestions || interviewQuestions.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <BookOpen className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Interview Questions Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Generate AI-powered interview questions WITH answers covering HR, Technical, Follow-up, and Project Defense topics.
        </p>
        <Button className="mt-4" onClick={handleGenerate}>
          <BookOpen className="h-4 w-4" />
          Generate Questions
        </Button>
      </div>
    );
  }

  const allText = interviewQuestions
    .map((cat) => `## ${cat.category}\n${cat.questions?.map((q) => `• ${q.question || q}`).join("\n")}`)
    .join("\n\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {interviewQuestions.length} categories generated
        </p>
        <div className="flex gap-2">
          <CopyButton text={allText} label="Copy All" />
          <Button variant="secondary" onClick={handleGenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {interviewQuestions.map((cat, catIdx) => {
        const Icon = categoryIcons[cat.category] || BookOpen;
        const colorClass = categoryColors[cat.category] || "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

        return (
          <Card key={catIdx} className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{cat.category}</h3>
              <CopyButton
                text={cat.questions?.map((q) => `• ${q.question || q}`).join("\n")}
                label="Copy"
              />
            </div>

            <div className="space-y-3">
              {cat.questions?.map((q, qIdx) => (
                <div key={qIdx} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="font-medium text-slate-900 dark:text-white">
                    <span className="mr-2 text-indigo-600 dark:text-indigo-400">Q{qIdx + 1}.</span>
                    {q.question || q}
                  </p>
                  {q.answer && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">A:</span> {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
