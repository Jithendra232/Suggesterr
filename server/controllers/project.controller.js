import Project from "../models/Project.js";
import mongoose from "mongoose";
import crypto from "crypto";

import {
  validDifficulties,
  validDomains,
  generateProject,
  analyzeProjectTemplate,
  detectStack,
  buildArchitectureDiagram
} from "../services/projectGenerator.service.js";

import { generateProjectWithGemini, analyzeProjectWithGemini, reverseEngineerWithGemini } from "../services/gemini.service.js";
import {
  generateInterviewQuestions,
  generateDocumentation,
  generateGitHubPlanner,
  generateLearningRoadmap,
  generateRecruiterAnalysis,
  generateProjectDescriptionAI,
  generateCommonMistakesAI,
  generateScalabilitySuggestionsAI,
  generateIndustryImprovementsAI,
  generateReadmeAI,
  generateResumeDescriptionAI,
  generateArchitectureExplanationAI,
  chatWithProject
} from "../services/aiFeatures.service.js";

function validateProjectInput({ skills, domain, difficulty }) {
  const cleanedSkills = Array.isArray(skills)
    ? skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 12)
    : [];

  if (cleanedSkills.length === 0) {
    return { error: "At least one skill is required" };
  }

  if (!validDomains.includes(domain)) {
    return { error: "Invalid domain selected" };
  }

  if (!validDifficulties.includes(difficulty)) {
    return { error: "Invalid difficulty selected" };
  }

  return { value: { skills: cleanedSkills, domain, difficulty } };
}

export async function createProject(req, res, next) {
  try {
    const validation = validateProjectInput(req.body);
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    console.log("\n=== CREATING NEW PROJECT ===");
    console.log("User:", req.user.clerkId);
    console.log("Input:", validation.value);

    let generated;
    let source;

    try {
      console.log("\nAttempting Gemini generation...");
      generated = await generateProjectWithGemini(validation.value);
      source = "gemini";
      console.log("✓ Successfully generated using Gemini");
    } catch (err) {
      console.error("\n✗ Gemini generation failed:");
      console.error("Error:", err.message);
      console.error("\nFalling back to template generation...");
      
      generated = generateProject(validation.value);
      source = "template";
      console.log("✓ Successfully generated using template");
    }

    const projectData = {
      userId: req.user.clerkId,
      ...validation.value,
      ...generated,
      source
    };

    console.log("\n=== FINAL PROJECT DATA BEFORE SAVE ===");
    console.log("Source:", source);
    console.log("Title:", projectData.title);
    console.log("Features count:", projectData.features?.length || 0);
    console.log("TechStack count:", projectData.techStack?.length || 0);
    console.log("DatabaseSchema count:", projectData.databaseSchema?.length || 0);
    console.log("ApiEndpoints count:", projectData.apiEndpoints?.length || 0);
    console.log("FolderStructure count:", projectData.folderStructure?.length || 0);
    console.log("Roadmap count:", projectData.roadmap?.length || 0);
    console.log("ResumePoints count:", projectData.resumePoints?.length || 0);
    console.log("=== END PROJECT DATA ===\n");

    const project = await Project.create(projectData);

    console.log("✓ Project saved to MongoDB with ID:", project._id);
    console.log("=== END PROJECT CREATION ===\n");

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("\n✗ CREATE PROJECT ERROR:");
    console.error(err);
    console.error("=== END ERROR ===\n");
    next(err);
  }
}

// ─── Analyze Existing Project ─────────────────────────────────────────────────

export async function analyzeProject(req, res, next) {
  try {
    const { projectName, projectDescription } = req.body;

    if (!projectName || typeof projectName !== "string" || projectName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Project name is required (min 2 characters)" });
    }

    const trimmedName = projectName.trim();
    const trimmedDescription = (projectDescription && typeof projectDescription === "string")
      ? projectDescription.trim()
      : "";

    console.log("\n=== ANALYZING EXISTING PROJECT ===");
    console.log("User:", req.user.clerkId);
    console.log("Project Name:", trimmedName);
    console.log("Project Description:", trimmedDescription || "Not provided");

    let generated;
    let source;

    try {
      console.log("\nAttempting Gemini analysis...");
      generated = await analyzeProjectWithGemini({ projectName: trimmedName, projectDescription: trimmedDescription });
      source = "gemini";
      console.log("✓ Successfully analyzed using Gemini");
    } catch (err) {
      console.error("\n✗ Gemini analysis failed:", err.message);
      console.error("\nFalling back to template analysis...");
      generated = analyzeProjectTemplate({ projectName: trimmedName });
      source = "template";
      console.log("✓ Successfully analyzed using template");
    }

    const projectData = {
      userId: req.user.clerkId,
      skills: generated.techStack || [],
      domain: "General",
      difficulty: "Intermediate",
      ...generated,
      source,
      sourceType: "analyzed"
    };

    console.log("=== ANALYZED PROJECT DATA ===");
    console.log("Title:", projectData.title);
    console.log("Source:", source);
    console.log("=== END DATA ===\n");

    const project = await Project.create(projectData);

    console.log("✓ Analyzed project saved to MongoDB with ID:", project._id);
    console.log("=== END ANALYSIS ===\n");

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("\n✗ ANALYZE PROJECT ERROR:");
    console.error(err);
    console.error("=== END ERROR ===\n");
    next(err);
  }
}

export async function getProjects(req, res, next) {
  try {
    const projects = await Project.find({ userId: req.user.clerkId }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Backward compatibility: generate architectureNodes for old projects
    if ((!project.architectureNodes || project.architectureNodes.length === 0) && project.techStack?.length > 0) {
      const detectedStack = detectStack(project.skills);
      const diagram = buildArchitectureDiagram(project.skills, detectedStack);
      project.architectureNodes = diagram.architectureNodes;
      project.architectureEdges = diagram.architectureEdges;
      await project.save();
    }

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 2: Project Versioning ───────────────────────────────────────────

export async function createProjectVersion(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const parent = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const parentId = parent.parentProjectId || parent._id;
    const existingVersions = await Project.countDocuments({
      userId: req.user.clerkId,
      $or: [{ _id: parentId }, { parentProjectId: parentId }]
    });
    const nextVersion = existingVersions + 1;

    const validation = validateProjectInput({
      skills: parent.skills,
      domain: parent.domain,
      difficulty: parent.difficulty
    });
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    let generated;
    let source;
    try {
      generated = await generateProjectWithGemini(validation.value);
      source = "gemini";
    } catch (err) {
      generated = generateProject(validation.value);
      source = "template";
    }

    const versionProject = await Project.create({
      userId: req.user.clerkId,
      ...validation.value,
      ...generated,
      source,
      parentProjectId: parentId,
      versionNumber: nextVersion
    });

    res.status(201).json({ success: true, project: versionProject });
  } catch (err) {
    next(err);
  }
}

export async function getProjectVersions(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const parentId = project.parentProjectId || project._id;
    const versions = await Project.find({
      userId: req.user.clerkId,
      $or: [{ _id: parentId }, { parentProjectId: parentId }]
    }).select("title versionNumber createdAt source difficulty domain").sort({ versionNumber: 1 });

    res.json({ success: true, versions });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 4: Shareable Links ──────────────────────────────────────────────

export async function generateShareLink(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.shareId) {
      project.shareId = crypto.randomBytes(8).toString("hex");
      await project.save();
    }

    res.json({ success: true, shareId: project.shareId });
  } catch (err) {
    next(err);
  }
}

export async function getSharedProject(req, res, next) {
  try {
    const { shareId } = req.params;
    if (!shareId) {
      return res.status(400).json({ success: false, message: "Share ID required" });
    }

    const project = await Project.findOne({ shareId }).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: "Shared project not found" });
    }

    // Strip sensitive data
    const { userId, shareId: _, ...publicProject } = project;
    res.json({ success: true, project: publicProject });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 5: Interview Questions ──────────────────────────────────────────

export async function generateProjectInterviewQuestions(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const questions = await generateInterviewQuestions(project.toObject());
    project.interviewQuestions = questions;
    await project.save();

    res.json({ success: true, interviewQuestions: questions });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 6: Documentation ────────────────────────────────────────────────

export async function generateProjectDocumentation(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const documentation = await generateDocumentation(project.toObject());
    project.documentation = documentation;
    project.generationStatus.documentation = "generated";
    await project.save();

    res.json({ success: true, documentation });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 7: GitHub Planner ───────────────────────────────────────────────

export async function generateProjectGitHubPlanner(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const githubPlanner = await generateGitHubPlanner(project.toObject());
    project.githubPlanner = githubPlanner;
    project.generationStatus.githubPlanner = "generated";
    await project.save();

    res.json({ success: true, githubPlanner });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 8: Learning Roadmap ─────────────────────────────────────────────

export async function generateProjectLearningRoadmap(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const learningRoadmap = await generateLearningRoadmap(project.toObject());
    project.learningRoadmap = learningRoadmap;
    project.generationStatus.learningRoadmap = "generated";
    await project.save();

    res.json({ success: true, learningRoadmap });
  } catch (err) {
    next(err);
  }
}

export async function updateLearningProgress(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project || !project.learningRoadmap) {
      return res.status(404).json({ success: false, message: "Learning roadmap not found" });
    }

    const { sectionIndex, topicIndex, completed } = req.body;
    if (
      project.learningRoadmap.sections[sectionIndex]?.topics[topicIndex] !== undefined
    ) {
      project.learningRoadmap.sections[sectionIndex].topics[topicIndex].completed = completed;
      await project.save();
    }

    res.json({ success: true, learningRoadmap: project.learningRoadmap });
  } catch (err) {
    next(err);
  }
}

// ─── Feature 9: Recruiter Analysis ───────────────────────────────────────────

export async function generateProjectRecruiterAnalysis(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const recruiterAnalysis = await generateRecruiterAnalysis(project.toObject());
    project.recruiterAnalysis = recruiterAnalysis;
    project.generationStatus.recruiterAnalysis = "generated";
    await project.save();

    res.json({ success: true, recruiterAnalysis });
  } catch (err) {
    next(err);
  }
}

// ─── Lazy Generation GET Endpoints ──────────────────────────────────────────

async function lazyGetOrGenerate(projectId, userId, field, statusField, generatorFn) {
  if (!mongoose.isValidObjectId(projectId)) {
    throw Object.assign(new Error("Invalid project id"), { status: 400 });
  }

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw Object.assign(new Error("Project not found"), { status: 404 });
  }

  // If already generated, return cached
  if (project[field] && project.generationStatus?.[statusField] === "generated") {
    return { [field]: project[field], cached: true };
  }

  // Generate, save, return
  project.generationStatus[statusField] = "generating";
  await project.save();

  const result = await generatorFn(project.toObject());
  project[field] = result;
  project.generationStatus[statusField] = "generated";
  await project.save();

  return { [field]: result, cached: false };
}

export async function getOrGenerateDocumentation(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "documentation", "documentation",
      generateDocumentation
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateGitHubPlanner(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "githubPlanner", "githubPlanner",
      generateGitHubPlanner
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateLearningRoadmap(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "learningRoadmap", "learningRoadmap",
      generateLearningRoadmap
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateRecruiterAnalysis(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "recruiterAnalysis", "recruiterAnalysis",
      generateRecruiterAnalysis
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

// ─── New Lazy Generation GET Endpoints ────────────────────────────────────────

export async function getOrGenerateProjectDescription(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "projectDescription", "projectDescription",
      generateProjectDescriptionAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateCommonMistakes(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "commonMistakes", "commonMistakes",
      generateCommonMistakesAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateScalabilitySuggestions(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "scalabilitySuggestions", "scalabilitySuggestions",
      generateScalabilitySuggestionsAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateIndustryImprovements(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "industryImprovements", "industryImprovements",
      generateIndustryImprovementsAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateReadme(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "readme", "readme",
      generateReadmeAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateResumeDescription(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "resumeDescription", "resumeDescription",
      generateResumeDescriptionAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

export async function getOrGenerateArchitectureExplanation(req, res, next) {
  try {
    const data = await lazyGetOrGenerate(
      req.params.id, req.user.clerkId,
      "architectureExplanation", "architectureExplanation",
      generateArchitectureExplanationAI
    );
    res.json({ success: true, ...data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export async function updateProjectProgress(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const { progressStatus, progressPercent } = req.body;
    if (progressStatus && ["not_started", "in_progress", "completed"].includes(progressStatus)) {
      project.progressStatus = progressStatus;
    }
    if (typeof progressPercent === "number" && progressPercent >= 0 && progressPercent <= 100) {
      project.progressPercent = Math.round(progressPercent);
    }
    await project.save();

    res.json({ success: true, progressStatus: project.progressStatus, progressPercent: project.progressPercent });
  } catch (err) {
    next(err);
  }
}

// ─── Reverse Engineer Product ─────────────────────────────────────────────────

export async function reverseEngineerProject(req, res, next) {
  try {
    const { productName } = req.body;

    if (!productName || typeof productName !== "string" || productName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Product name is required (min 2 characters)" });
    }

    const trimmedName = productName.trim();

    console.log("\n=== REVERSE ENGINEERING PRODUCT ===");
    console.log("User:", req.user.clerkId);
    console.log("Product:", trimmedName);

    let generated;
    let source;

    try {
      console.log("\nAttempting Gemini reverse engineering...");
      generated = await reverseEngineerWithGemini({ productName: trimmedName });
      source = "gemini";
      console.log("✓ Successfully reverse engineered using Gemini");
    } catch (err) {
      console.error("\n✗ Gemini reverse engineering failed:", err.message);
      console.error("\nFalling back to template...");
      generated = analyzeProjectTemplate({ projectName: trimmedName });
      // Clear resume/career fields for template fallback too
      generated.resumePoints = [];
      generated.resumeBullets = [];
      generated.alternatives = [];
      generated.roadmap = [];
      source = "template";
      console.log("✓ Successfully reverse engineered using template");
    }

    const projectData = {
      userId: req.user.clerkId,
      skills: generated.techStack || [],
      domain: "General",
      difficulty: "Advanced",
      ...generated,
      source,
      sourceType: "reverse_engineered"
    };

    const project = await Project.create(projectData);

    console.log("✓ Reverse engineered project saved:", project._id);
    console.log("=== END REVERSE ENGINEERING ===\n");

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("\n✗ REVERSE ENGINEER ERROR:", err);
    next(err);
  }
}

// ─── AI Mentor Chat ──────────────────────────────────────────────────────────

export async function chatWithProjectController(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.clerkId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const response = await chatWithProject(project.toObject(), message.trim());
    res.json({ success: true, response });
  } catch (err) {
    console.error("\n✗ CHAT ERROR:", err);
    next(err);
  }
}
