import { FileDown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { exportProjectAsPDF } from "../../utils/pdfExport.js";
import React from 'react';

export default function ExportButton({ project }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!project) return;
    setExporting(true);
    try {
      await exportProjectAsPDF(project);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to export PDF");
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      <FileDown className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}
