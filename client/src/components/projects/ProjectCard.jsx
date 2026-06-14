import { Calendar, Clock, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import React from 'react'
export default function ProjectCard({ project, onDelete, deleting = false, showActions = true }) {
  const date = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Not saved";

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{project.title}</h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">{project.domain}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{project.difficulty}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{project.description}</p>
        </div>
        {showActions ? (
          <div className="flex flex-none gap-2">
            {project._id ? (
              <Link to={`/history/${project._id}`}>
                <Button variant="secondary" className="px-3" aria-label="View project">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
            {onDelete ? (
              <Button variant="danger" className="px-3" loading={deleting} onClick={() => onDelete(project._id)} aria-label="Delete project">
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.skills?.map((skill) => (
              <span key={skill} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Estimated Time</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-slate-400" />
            {project.estimatedTime}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Created</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-slate-400" />
            {date}
          </p>
        </div>
      </div>
    </Card>
  );
}
