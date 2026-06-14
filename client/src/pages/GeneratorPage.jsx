import { useAuth } from "@clerk/clerk-react";
import { Plus, Search, Trash2, Wand2, X, Cpu } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ProjectDetails from "../components/projects/ProjectDetails.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { DIFFICULTIES, DOMAINS } from "../config/constants.js";
import { analyzeProject, createProject, deleteProject, reverseEngineerProject } from "../services/api.js";
import React from 'react'

const MODE_GENERATE = "generate";
const MODE_ANALYZE = "analyze";
const MODE_REVERSE = "reverse";

export default function GeneratorPage() {
  const { getToken } = useAuth();
  const [mode, setMode] = useState(MODE_GENERATE);

  // Generate mode state
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [domain, setDomain] = useState("AI/ML");
  const [difficulty, setDifficulty] = useState("Beginner");

  // Analyze mode state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Reverse engineer mode state
  const [productName, setProductName] = useState("");

  // Shared state
  const [generatedProject, setGeneratedProject] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  function addSkill() {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((current) => [...current, value]);
    setSkillInput("");
    setErrors((current) => ({ ...current, skills: "" }));
  }

  function removeSkill(skillToRemove) {
    setSkills((current) => current.filter((skill) => skill !== skillToRemove));
  }

  async function handleGenerate(event) {
    event.preventDefault();
    if (skills.length === 0) {
      setErrors({ skills: "Add at least one skill." });
      return;
    }

    setGenerating(true);
    setErrors({});
    try {
      const data = await createProject({ skills, domain, difficulty }, getToken);
      setGeneratedProject(data.project);
      toast.success("Project generated and saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    if (!projectName.trim() || projectName.trim().length < 2) {
      setErrors({ projectName: "Enter a project name (min 2 characters)." });
      return;
    }

    setGenerating(true);
    setErrors({});
    try {
      const data = await analyzeProject(projectName.trim(), projectDescription.trim(), getToken);
      setGeneratedProject(data.project);
      toast.success("Project analyzed and saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleReverseEngineer(event) {
    event.preventDefault();
    if (!productName.trim() || productName.trim().length < 2) {
      setErrors({ productName: "Enter a product name (min 2 characters)." });
      return;
    }

    setGenerating(true);
    setErrors({});
    try {
      const data = await reverseEngineerProject(productName.trim(), getToken);
      setGeneratedProject(data.project);
      toast.success("Product reverse engineered and saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!generatedProject?._id) {
      setGeneratedProject(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteProject(generatedProject._id, getToken);
      setGeneratedProject(null);
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Generator</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Generate a new project from your skills, or analyze an existing project concept.</p>

        {/* Mode Tabs */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => { setMode(MODE_GENERATE); setErrors({}); }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === MODE_GENERATE
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Generate New Project
          </button>
          <button
            onClick={() => { setMode(MODE_ANALYZE); setErrors({}); }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === MODE_ANALYZE
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Search className="h-4 w-4" />
            Analyze Existing Project
          </button>
          <button
            onClick={() => { setMode(MODE_REVERSE); setErrors({}); }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === MODE_REVERSE
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Cpu className="h-4 w-4" />
            Reverse Engineer Product
          </button>
        </div>

        {/* Generate Mode */}
        {mode === MODE_GENERATE && (
          <Card className="mt-5 p-5">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label htmlFor="skill" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Skills
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="skill"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="React, MongoDB, Python"
                    className="focus-ring min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <Button type="button" variant="secondary" onClick={addSkill} aria-label="Add skill">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.skills ? <p className="mt-2 text-sm text-red-600">{errors.skills}</p> : null}
                {skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {skill}
                        <button type="button" className="text-slate-500 hover:text-red-600" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="domain" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Domain
                  </label>
                  <select id="domain" value={domain} onChange={(event) => setDomain(event.target.value)} className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                    {DOMAINS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="difficulty" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Difficulty
                  </label>
                  <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                    {DIFFICULTIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" loading={generating} className="w-full">
                Generate Project
              </Button>
            </form>
          </Card>
        )}

        {/* Analyze Mode */}
        {mode === MODE_ANALYZE && (
          <Card className="mt-5 p-5">
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div>
                <label htmlFor="projectName" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Project Name
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter the name of an existing project concept. Gemini will analyze it and generate a full professional blueprint.
                </p>
                <input
                  id="projectName"
                  value={projectName}
                  onChange={(event) => { setProjectName(event.target.value); setErrors({}); }}
                  placeholder="Expense Tracker, Hostel Management System, AI Resume Analyzer"
                  className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                {errors.projectName ? <p className="mt-2 text-sm text-red-600">{errors.projectName}</p> : null}
              </div>

              <div>
                <label htmlFor="projectDescription" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Project Description <span className="font-normal text-slate-500 dark:text-slate-400">(Optional but Recommended)</span>
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  A brief description helps Gemini produce a more accurate and detailed blueprint.
                </p>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  rows={3}
                  placeholder="AI-powered platform that analyzes resumes, calculates ATS score, compares resumes against job descriptions, and suggests improvements."
                  className="focus-ring mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <Button type="submit" loading={generating} className="w-full">
                <Search className="h-4 w-4" />
                Analyze Project
              </Button>
            </form>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Example project names:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Expense Tracker", "E-Commerce Store", "AI Resume Analyzer", "Task Management App", "Social Media Dashboard"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => { setProjectName(example); setErrors({}); }}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Reverse Engineer Mode */}
        {mode === MODE_REVERSE && (
          <Card className="mt-5 p-5">
            <form onSubmit={handleReverseEngineer} className="space-y-5">
              <div>
                <label htmlFor="productName" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Product Name
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter a well-known product. Gemini will reverse engineer its architecture, tech stack, database design, APIs, and system design.
                </p>
                <input
                  id="productName"
                  value={productName}
                  onChange={(event) => { setProductName(event.target.value); setErrors({}); }}
                  placeholder="Netflix, Swiggy, Amazon, Instagram, ChatGPT"
                  className="focus-ring mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                {errors.productName ? <p className="mt-2 text-sm text-red-600">{errors.productName}</p> : null}
              </div>

              <Button type="submit" loading={generating} className="w-full">
                <Cpu className="h-4 w-4" />
                Reverse Engineer
              </Button>
            </form>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Popular products to reverse engineer:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Netflix", "Swiggy", "Amazon", "Instagram", "ChatGPT", "Spotify", "Uber", "Airbnb"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => { setProductName(example); setErrors({}); }}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {mode === MODE_ANALYZE ? "Analyzed Project" : mode === MODE_REVERSE ? "Reverse Engineered Product" : "Generated Project"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">The result is saved to your history automatically.</p>
          </div>
          {generatedProject ? (
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
        {generatedProject ? (
          <ProjectDetails project={generatedProject} />
        ) : (
          <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {mode === MODE_ANALYZE
                  ? "Your analyzed project will appear here"
                  : mode === MODE_REVERSE
                  ? "Your reverse engineered product will appear here"
                  : "Your generated project will appear here"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                {mode === MODE_ANALYZE
                  ? "Enter a project name above and Gemini will produce a full blueprint with features, tech stack, architecture, and more."
                  : mode === MODE_REVERSE
                  ? "Enter a well-known product above and Gemini will reverse engineer its architecture, tech stack, scaling strategy, and system design."
                  : "Use the form to create a project idea with features, tech stack, and an estimated build timeline."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
