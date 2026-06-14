import { Database, Table } from "lucide-react";
import React from 'react';

export default function SchemaVisualizer({ schema }) {
  if (!schema || schema.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {schema.map((collection, index) => (
        <div
          key={index}
          className="rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-slate-900"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-indigo-200 pb-2 dark:border-indigo-800">
            <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">{collection.collection}</h4>
          </div>
          <div className="space-y-1">
            {collection.fields?.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded bg-white/50 px-2 py-1 text-sm dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">{field.name}</span>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {field.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
