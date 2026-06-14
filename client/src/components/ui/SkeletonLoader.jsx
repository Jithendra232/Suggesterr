import React from 'react';

function SkeletonLine({ className = "" }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonLine className="h-6 w-40" />
            <SkeletonLine className="h-5 w-20 rounded-full" />
            <SkeletonLine className="h-5 w-20 rounded-full" />
          </div>
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <SkeletonLine className="h-9 w-9 rounded-md" />
          <SkeletonLine className="h-9 w-9 rounded-md" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 md:grid-cols-3">
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-16" />
          <div className="flex flex-wrap gap-2">
            <SkeletonLine className="h-6 w-16 rounded-md" />
            <SkeletonLine className="h-6 w-16 rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-16" />
          <SkeletonLine className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <SkeletonLine className="h-8 w-64" />
        <SkeletonLine className="mt-4 h-4 w-full" />
        <SkeletonLine className="mt-2 h-4 w-3/4" />
        <div className="mt-5 flex gap-2">
          <SkeletonLine className="h-7 w-24 rounded-full" />
          <SkeletonLine className="h-7 w-20 rounded-full" />
          <SkeletonLine className="h-7 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <SkeletonLine className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            <SkeletonLine className="h-8 w-full rounded-md" />
            <SkeletonLine className="h-8 w-full rounded-md" />
            <SkeletonLine className="h-8 w-full rounded-md" />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <SkeletonLine className="h-5 w-40" />
          <div className="mt-4 flex flex-wrap gap-2">
            <SkeletonLine className="h-8 w-24 rounded-md" />
            <SkeletonLine className="h-8 w-20 rounded-md" />
            <SkeletonLine className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <ProjectCardSkeleton />
      <ProjectCardSkeleton />
    </div>
  );
}

export default function SkeletonLoader({ type = "card", count = 1 }) {
  const skeletons = {
    card: ProjectCardSkeleton,
    details: ProjectDetailsSkeleton,
    dashboard: DashboardSkeleton
  };

  const Component = skeletons[type] || ProjectCardSkeleton;

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
