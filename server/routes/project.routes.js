import { Router } from "express";
import {
  createProject,
  analyzeProject,
  deleteProject,
  getProject,
  getProjects,
  createProjectVersion,
  getProjectVersions,
  generateShareLink,
  getSharedProject,
  generateProjectInterviewQuestions,
  generateProjectDocumentation,
  generateProjectGitHubPlanner,
  generateProjectLearningRoadmap,
  updateLearningProgress,
  generateProjectRecruiterAnalysis,
  getOrGenerateDocumentation,
  getOrGenerateGitHubPlanner,
  getOrGenerateLearningRoadmap,
  getOrGenerateRecruiterAnalysis
} from "../controllers/project.controller.js";
import { requireClerkAuth, syncAuthenticatedUser } from "../middleware/auth.middleware.js";

const router = Router();

// Public route (no auth required)
router.get("/shared/:shareId", getSharedProject);

// Protected routes
router.use(requireClerkAuth, syncAuthenticatedUser);

router.route("/").post(createProject).get(getProjects);

// Analyze Existing Project (must be before /:id routes)
router.post("/analyze", analyzeProject);

router.route("/:id").get(getProject).delete(deleteProject);

// Feature 2: Versioning
router.post("/:id/versions", createProjectVersion);
router.get("/:id/versions", getProjectVersions);

// Feature 4: Shareable Links
router.post("/:id/share", generateShareLink);

// Feature 5: Interview Questions
router.post("/:id/interview-questions", generateProjectInterviewQuestions);

// Feature 6: Documentation (GET = lazy load, POST = force regenerate)
router.get("/:id/documentation", getOrGenerateDocumentation);
router.post("/:id/documentation", generateProjectDocumentation);

// Feature 7: GitHub Planner (GET = lazy load, POST = force regenerate)
router.get("/:id/github-planner", getOrGenerateGitHubPlanner);
router.post("/:id/github-planner", generateProjectGitHubPlanner);

// Feature 8: Learning Roadmap (GET = lazy load, POST = force regenerate)
router.get("/:id/learning-roadmap", getOrGenerateLearningRoadmap);
router.post("/:id/learning-roadmap", generateProjectLearningRoadmap);
router.put("/:id/learning-roadmap/progress", updateLearningProgress);

// Feature 9: Recruiter Analysis (GET = lazy load, POST = force regenerate)
router.get("/:id/recruiter-analysis", getOrGenerateRecruiterAnalysis);
router.post("/:id/recruiter-analysis", generateProjectRecruiterAnalysis);

export default router;
