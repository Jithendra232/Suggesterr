import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import Spinner from "../ui/Spinner.jsx";
import { fetchRecruiterAnalysis, generateRecruiterAnalysis } from "../../services/api.js";
import { Briefcase, RefreshCw, TrendingUp, Target, Award, Zap, AlertTriangle, ThumbsUp } from "lucide-react";
import React from "react";

function ScoreCard({ label, value, max = 100, icon: Icon, color }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}<span className="ml-1 text-sm font-normal text-slate-400">/{max}</span></p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-2 rounded-full transition-all ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
}

function InsightList({ title, items, icon: Icon, colorClass }) {
  if (!items?.length) return null;
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function RecruiterAnalysisPanel({ projectId, recruiterAnalysis, onRefresh }) {
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if ((!recruiterAnalysis || !recruiterAnalysis.recruiterScore) && !fetchedRef.current) {
      fetchedRef.current = true;
      setAutoLoading(true);
      fetchRecruiterAnalysis(projectId, getToken)
        .then(() => onRefresh())
        .catch((err) => toast.error(err.message || "Failed to load recruiter analysis"))
        .finally(() => setAutoLoading(false));
    }
  }, [projectId, recruiterAnalysis, getToken, onRefresh]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateRecruiterAnalysis(projectId, getToken);
      toast.success("Recruiter analysis generated!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to generate recruiter analysis");
    } finally {
      setGenerating(false);
    }
  }

  if (generating || autoLoading) return <Spinner label="Generating recruiter analysis with AI..." />;

  if (!recruiterAnalysis || Object.keys(recruiterAnalysis).length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <Briefcase className="mb-3 h-8 w-8 text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">No Recruiter Analysis Yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Get a professional recruiter perspective on your project — scores, resume impact, strengths, weaknesses, and hiring manager notes.
        </p>
        <Button className="mt-4" onClick={handleGenerate}>
          <Briefcase className="h-4 w-4" />
          Analyze for Recruiters
        </Button>
      </div>
    );
  }

  const r = recruiterAnalysis;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">Professional recruiter perspective</p>
        <Button variant="secondary" onClick={handleGenerate}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      {/* Overall Recruiter Score - Hero */}
      {r.recruiterScore !== undefined && (
        <Card className="overflow-hidden p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-3xl font-bold text-white">{r.recruiterScore}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recruiter Score</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {r.recruiterScore >= 80 ? "Excellent — Strong portfolio piece" : r.recruiterScore >= 60 ? "Good — Solid project for interviews" : r.recruiterScore >= 40 ? "Average — Room for improvement" : "Needs work — Consider adding more complexity"}
              </p>
              {r.interviewDifficulty && (
                <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  Interview Difficulty: {r.interviewDifficulty}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Score Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {r.resumeImpact !== undefined && (
          <ScoreCard label="Resume Impact" value={r.resumeImpact} icon={TrendingUp} color="text-blue-600 dark:text-blue-400" />
        )}
        {r.skillDemonstration !== undefined && (
          <ScoreCard label="Skill Demo" value={r.skillDemonstration} icon={Target} color="text-emerald-600 dark:text-emerald-400" />
        )}
        {r.portfolioStrength !== undefined && (
          <ScoreCard label="Portfolio Strength" value={r.portfolioStrength} icon={Award} color="text-purple-600 dark:text-purple-400" />
        )}
        {r.marketDemand !== undefined && (
          <ScoreCard label="Market Demand" value={r.marketDemand} icon={Zap} color="text-amber-600 dark:text-amber-400" />
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-5 lg:grid-cols-2">
        <InsightList title="Strengths" items={r.strengths} icon={ThumbsUp} colorClass="text-emerald-600 dark:text-emerald-400" />
        <InsightList title="Areas for Improvement" items={r.weaknesses} icon={AlertTriangle} colorClass="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Hiring Manager Notes */}
      {r.hiringManagerNotes && (
        <Card className="p-5">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Hiring Manager Notes</h3>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{r.hiringManagerNotes}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}
