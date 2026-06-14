import React from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, BrainCircuit, FolderKanban, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
const features = [
  { title: "Generate Project Ideas", description: "Turn your skills and target domain into practical project concepts.", icon: BrainCircuit },
  { title: "Save Projects", description: "Keep every generated idea organized in a searchable project history.", icon: Bookmark },
  { title: "Build Better Portfolios", description: "Choose ideas with clear features, stack guidance, and realistic timelines.", icon: FolderKanban },
  { title: "Personalized Recommendations", description: "Receive suggestions shaped around skill level and project difficulty.", icon: Sparkles }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-bold text-slate-900 dark:text-white">
            AI Project Generator
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="secondary">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 dark:border-slate-700">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">Portfolio-ready project ideas</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                AI Project Generator
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                Generate realistic software project ideas from your skills, domain, and difficulty level. Save the best concepts and shape them into recruiter-friendly portfolio work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button className="w-full sm:w-auto">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/generator">
                    <Button className="w-full sm:w-auto">
                      Generate a Project <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Generated Project</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Intermediate · Web Development</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">Saved</span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Task Management App</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  A collaborative task platform with dashboards, role-based workspaces, deadline tracking, and productivity analytics.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Authentication", "Project boards", "Team comments", "Analytics"].map((item) => (
                    <div key={item} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Features</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Everything a student needs to move from vague idea to focused build plan.</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-4 inline-flex rounded-md bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {["Add your skills", "Choose domain and difficulty", "Generate and save your idea"].map((step, index) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Step {index + 1}</span>
                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-lg border border-slate-200 bg-white p-6 md:flex-row md:items-center dark:border-slate-700 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to find your next portfolio project?</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Start with your current skills and leave with a clear build direction.</p>
            </div>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/generator">
                <Button>Open Generator</Button>
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>
    </div>
  );
}
