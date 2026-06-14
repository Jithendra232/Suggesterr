import jsPDF from "jspdf";

export async function exportProjectAsPDF(project) {
  try {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageHeight = doc.internal.pageSize.height;

    function checkPage(needed = 20) {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    }

    function addTitle(title, size = 18) {
      checkPage(30);
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, y);
      y += size * 0.6;
    }

    function addText(text, size = 11, indent = 0) {
      if (!text) return;
      doc.setFontSize(size);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, 170 - indent);
      checkPage(lines.length * size * 0.5);
      doc.text(lines, margin + indent, y);
      y += lines.length * size * 0.5;
    }

    function addBullet(text, indent = 10) {
      if (!text) return;
      checkPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("•", margin + indent - 5, y);
      const lines = doc.splitTextToSize(text, 165 - indent);
      doc.text(lines, margin + indent, y);
      y += lines.length * 5.5;
    }

    function addSpacing(space = 10) {
      y += space;
    }

    addTitle(project.title, 22);
    addSpacing(8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${project.domain} | ${project.difficulty} | ${project.estimatedTime}`, margin, y);
    y += 8;
    doc.setTextColor(0);

    addSpacing(5);
    addTitle("Description", 14);
    addText(project.description, 11);
    addSpacing(8);

    if (project.architecture) {
      addTitle("Architecture", 14);
      addText(project.architecture, 10);
      addSpacing(8);
    }

    if (project.complexityScore !== undefined) {
      addTitle("Complexity Score", 14);
      const label = project.complexityScore <= 40 ? "Beginner" : project.complexityScore <= 70 ? "Intermediate" : "Advanced";
      addText(`${project.complexityScore}/100 - ${label}`, 11);
      addSpacing(8);
    }

    if (project.features?.length > 0) {
      addTitle("Core Features", 14);
      project.features.forEach(f => addBullet(f));
      addSpacing(8);
    }

    if (project.techStack?.length > 0) {
      addTitle("Tech Stack", 14);
      project.techStack.forEach(t => addBullet(t));
      addSpacing(8);
    }

    if (project.databaseSchema?.length > 0) {
      addTitle("Database Schema", 14);
      project.databaseSchema.forEach(schema => {
        checkPage(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Collection: ${schema.collection}`, margin + 5, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        schema.fields?.forEach(field => {
          checkPage(12);
          doc.text(`• ${field.name} (${field.type})`, margin + 12, y);
          y += 5;
          if (field.description) {
            addText(field.description, 9, 17);
          }
        });
        addSpacing(5);
      });
      addSpacing(8);
    }

    if (project.apiEndpoints?.length > 0) {
      addTitle("API Endpoints", 14);
      project.apiEndpoints.forEach(api => {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`${api.method}`, margin + 5, y);
        doc.setFont("helvetica", "normal");
        doc.text(` ${api.endpoint}`, margin + 20, y);
        y += 5;
        if (api.description) {
          addText(api.description, 9, 10);
        }
        addSpacing(2);
      });
      addSpacing(8);
    }

    if (project.folderStructure?.length > 0) {
      addTitle("Folder Structure", 14);
      project.folderStructure.forEach(f => addBullet(f, 10));
      addSpacing(8);
    }

    if (project.roadmap?.length > 0) {
      addTitle("Development Roadmap", 14);
      project.roadmap.forEach((step, idx) => {
        checkPage(15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`${idx + 1}. ${step}`, margin + 5, y);
        y += 7;
      });
      addSpacing(8);
    }

    if (project.resumePoints?.length > 0) {
      addTitle("Resume Points", 14);
      project.resumePoints.forEach(p => addBullet(p));
      addSpacing(8);
    }

    if (project.resumeBullets?.length > 0) {
      addTitle("ATS Resume Bullets", 14);
      project.resumeBullets.forEach(b => addBullet(b));
      addSpacing(8);
    }

    if (project.improvements?.length > 0) {
      addTitle("Improvement Suggestions", 14);
      project.improvements.forEach(i => addBullet(i));
      addSpacing(8);
    }

    if (project.alternatives?.length > 0) {
      addTitle("Alternative Project Ideas", 14);
      project.alternatives.forEach(alt => {
        checkPage(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(alt.title, margin + 5, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        addText(`${alt.description} (${alt.difficulty})`, 10, 10);
        addSpacing(3);
      });
      addSpacing(8);
    }

    if (project.techAdvisor) {
      addTitle("Tech Stack Advisor", 14);
      const ta = project.techAdvisor;
      if (ta.recommendedFrontend?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Frontend:", margin + 5, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        ta.recommendedFrontend.forEach(t => addBullet(t, 10));
        addSpacing(3);
      }
      if (ta.recommendedBackend?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Backend:", margin + 5, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        ta.recommendedBackend.forEach(t => addBullet(t, 10));
        addSpacing(3);
      }
      if (ta.recommendedDatabase?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Database:", margin + 5, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        ta.recommendedDatabase.forEach(t => addBullet(t, 10));
        addSpacing(3);
      }
      if (ta.deploymentSuggestions?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Deployment:", margin + 5, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        ta.deploymentSuggestions.forEach(t => addBullet(t, 10));
      }
    }

    const filename = project.title
      ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf"
      : "project.pdf";

    doc.save(filename);
    return true;
  } catch (err) {
    console.error("PDF export error:", err);
    throw err;
  }
}
