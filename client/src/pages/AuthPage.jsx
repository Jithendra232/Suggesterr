import React from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function AuthPage({ mode }) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-bold text-slate-900 dark:text-white">
            AI Project Generator
          </Link>
          <Link to={isSignUp ? "/sign-in" : "/sign-up"} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            {isSignUp ? "Sign In" : "Create Account"}
          </Link>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        {isSignUp ? (
          <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
        ) : (
          <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        )}
      </main>
    </div>
  );
}
