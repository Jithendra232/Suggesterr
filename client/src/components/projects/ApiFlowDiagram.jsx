import { ArrowDown, Globe, Server, Database } from "lucide-react";
import React from 'react';

export default function ApiFlowDiagram({ endpoints }) {
  if (!endpoints || endpoints.length === 0) return null;

  const grouped = endpoints.reduce((acc, ep) => {
    const parts = ep.endpoint.split('/').filter(Boolean);
    const group = parts[1] || parts[0] || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(ep);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/50">
          <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Frontend</span>
        </div>
        <ArrowDown className="h-6 w-6 text-slate-400" />
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-950/50">
          <Server className="h-8 w-8 text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-green-900 dark:text-green-300">API Layer</span>
        </div>
        <ArrowDown className="h-6 w-6 text-slate-400" />
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/50">
          <Database className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-bold text-amber-900 dark:text-amber-300">Database</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([group, eps]) => (
          <div key={group} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <h5 className="mb-2 text-sm font-bold text-slate-900 dark:text-white capitalize">/{group}</h5>
            <div className="space-y-1">
              {eps.map((ep, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    {ep.method}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{ep.endpoint}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
