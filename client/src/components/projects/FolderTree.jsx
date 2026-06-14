import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useState } from "react";
import React from 'react';

function buildTree(paths) {
  const root = {};
  paths.forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    parts.forEach(part => {
      if (!current[part]) current[part] = {};
      current = current[part];
    });
  });
  return root;
}

function TreeNode({ name, children, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const hasChildren = children && Object.keys(children).length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />
        ) : (
          <span className="w-4" />
        )}
        <Folder className="h-4 w-4 text-amber-500" />
        <span className="font-mono text-slate-700 dark:text-slate-300">{name}</span>
      </button>
      {hasChildren && open && (
        <div>
          {Object.entries(children).map(([childName, childChildren]) => (
            <TreeNode key={childName} name={childName} children={childChildren} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ folders }) {
  if (!folders || folders.length === 0) return null;

  const tree = buildTree(folders);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      {Object.entries(tree).map(([name, children]) => (
        <TreeNode key={name} name={name} children={children} />
      ))}
    </div>
  );
}
