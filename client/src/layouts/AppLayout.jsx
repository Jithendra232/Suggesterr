import { NavLink, Outlet } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { FolderClock, LayoutDashboard, Lightbulb, Menu, X, BarChart3, GitCompareArrows } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import React from 'react'

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generator", label: "Generator", icon: Lightbulb },
  { to: "/history", label: "History", icon: FolderClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/compare", label: "Compare", icon: GitCompareArrows }
];

function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:static lg:block lg:translate-x-0 dark:border-slate-700 dark:bg-slate-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-950 dark:text-white">AI Project Generator</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Student project workspace</p>
          </div>
          <button className="focus-ring rounded-md p-2 text-slate-600 lg:hidden dark:text-slate-400" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button className="focus-ring rounded-md p-2 text-slate-600 lg:hidden dark:text-slate-400" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Welcome back, {user?.firstName || user?.fullName || "student"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate ideas, save your best work, and build a stronger portfolio.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
