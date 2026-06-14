import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

/* Color palette for node styling – cycles if more nodes than colors */
const NODE_COLORS = [
  { bg: '#dbeafe', border: '#3b82f6' },  // blue
  { bg: '#d1fae5', border: '#10b981' },  // green
  { bg: '#fef3c7', border: '#f59e0b' },  // amber
  { bg: '#fce7f3', border: '#ec4899' },  // pink
  { bg: '#e9d5ff', border: '#a855f7' },  // purple
  { bg: '#fee2e2', border: '#ef4444' },  // red
  { bg: '#ccfbf1', border: '#14b8a6' },  // teal
  { bg: '#e0e7ff', border: '#6366f1' },  // indigo
];

const DARK_NODE_COLORS = [
  { bg: '#1e3a5f', border: '#60a5fa' },
  { bg: '#064e3b', border: '#34d399' },
  { bg: '#78350f', border: '#fbbf24' },
  { bg: '#831843', border: '#f472b6' },
  { bg: '#4c1d95', border: '#c084fc' },
  { bg: '#7f1d1d', border: '#f87171' },
  { bg: '#134e4a', border: '#2dd4bf' },
  { bg: '#312e81', border: '#818cf8' },
];

/**
 * Auto-layout: primary flow goes top→down (main chain).
 * Auxiliary nodes (auth, cache, ai, etc.) branch to the sides.
 */
function computeLayout(architectureNodes, architectureEdges) {
  if (!architectureNodes || architectureNodes.length === 0) return { nodes: [], edges: [] };

  // Build adjacency to find the "main chain" (longest path from root)
  const adjacency = {};
  const inDegree = {};
  architectureNodes.forEach(n => { adjacency[n.id] = []; inDegree[n.id] = 0; });
  architectureEdges.forEach(e => {
    if (adjacency[e.source]) adjacency[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  // Find root nodes (in-degree 0)
  const roots = architectureNodes.filter(n => (inDegree[n.id] || 0) === 0);
  const mainChain = [];
  const visited = new Set();

  // Walk the longest path from first root to build main chain
  function walk(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    mainChain.push(nodeId);
    const children = adjacency[nodeId] || [];
    if (children.length > 0) walk(children[0]);
  }
  if (roots.length > 0) walk(roots[0].id);

  // Any node not in main chain is auxiliary
  const auxNodes = architectureNodes.filter(n => !visited.has(n.id));

  // Position main chain vertically centered
  const startX = 250;
  const yGap = 150;
  const positioned = {};

  mainChain.forEach((nodeId, i) => {
    positioned[nodeId] = { x: startX, y: i * yGap };
  });

  // Position auxiliary nodes to alternating sides
  auxNodes.forEach((node, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    // Try to place near a connected main-chain node
    const connectedEdge = architectureEdges.find(
      e => (e.source === node.id && visited.has(e.target)) ||
           (e.target === node.id && visited.has(e.source))
    );
    let baseY = 75;
    if (connectedEdge) {
      const connectedId = connectedEdge.source === node.id ? connectedEdge.target : connectedEdge.source;
      if (positioned[connectedId]) baseY = positioned[connectedId].y;
    }
    positioned[node.id] = { x: startX + side * 280, y: baseY };
  });

  // Build ReactFlow nodes
  const isDark = document.documentElement.classList.contains('dark');
  const palette = isDark ? DARK_NODE_COLORS : NODE_COLORS;

  const nodes = architectureNodes.map((node, i) => {
    const color = palette[i % palette.length];
    const pos = positioned[node.id] || { x: 0, y: i * yGap };
    return {
      id: node.id,
      type: 'default',
      data: { label: node.label },
      position: pos,
      style: {
        background: color.bg,
        border: `2px solid ${color.border}`,
        padding: 15,
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 13,
        minWidth: 140,
        textAlign: 'center',
      },
    };
  });

  // Build ReactFlow edges
  const edges = architectureEdges.map((edge, i) => ({
    id: `e-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
}

export default function ArchitectureDiagram({ project }) {
  const { nodes, edges } = useMemo(() => {
    const archNodes = project?.architectureNodes;
    const archEdges = project?.architectureEdges;

    if (Array.isArray(archNodes) && archNodes.length > 0 &&
        Array.isArray(archEdges) && archEdges.length > 0) {
      return computeLayout(archNodes, archEdges);
    }

    // Fallback: generate from techStack if available
    if (Array.isArray(project?.techStack) && project.techStack.length > 0) {
      const stack = project.techStack.map(t => t.toLowerCase());
      const fbNodes = [];
      const fbEdges = [];

      const frontend = stack.find(t => ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'asp.net', 'django', 'flask'].some(f => t.includes(f)));
      const backend = stack.find(t => ['express', 'nestjs', 'fastapi', 'spring', 'asp.net', 'django', 'flask', 'rails'].some(b => t.includes(b)));
      const database = stack.find(t => ['mongo', 'postgres', 'mysql', 'sqlite', 'redis', 'sql server', 'dynamodb', 'firebase'].some(d => t.includes(d)));
      const auth = stack.find(t => ['clerk', 'auth0', 'jwt', 'firebase auth', 'passport', 'oauth'].some(a => t.includes(a)));

      if (frontend) { fbNodes.push({ id: 'frontend', label: `Frontend\n(${frontend})` }); }
      if (backend) { fbNodes.push({ id: 'backend', label: `Backend API\n(${backend})` }); }
      if (database) { fbNodes.push({ id: 'database', label: `Database\n(${database})` }); }
      if (auth) { fbNodes.push({ id: 'auth', label: `Authentication\n(${auth})` }); }

      if (fbNodes.length === 0) {
        // Just list the first few tech stack items
        project.techStack.slice(0, 4).forEach((t, i) => {
          fbNodes.push({ id: `node-${i}`, label: t });
        });
        for (let i = 0; i < fbNodes.length - 1; i++) {
          fbEdges.push({ source: fbNodes[i].id, target: fbNodes[i + 1].id });
        }
      } else {
        if (fbNodes.find(n => n.id === 'frontend') && fbNodes.find(n => n.id === 'backend'))
          fbEdges.push({ source: 'frontend', target: 'backend' });
        if (fbNodes.find(n => n.id === 'backend') && fbNodes.find(n => n.id === 'database'))
          fbEdges.push({ source: 'backend', target: 'database' });
        if (fbNodes.find(n => n.id === 'auth') && fbNodes.find(n => n.id === 'frontend'))
          fbEdges.push({ source: 'auth', target: 'frontend' });
      }

      return computeLayout(fbNodes, fbEdges);
    }

    return { nodes: [], edges: [] };
  }, [project]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">No architecture diagram available</p>
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
