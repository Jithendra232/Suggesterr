import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  }
}, { _id: false });

const databaseSchemaSchema = new mongoose.Schema({
  collection: {
    type: String,
    required: true,
    trim: true
  },
  fields: {
    type: [fieldSchema],
    default: []
  }
}, { _id: false });

const apiEndpointSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  }
}, { _id: false });

const alternativeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true
  }
}, { _id: false });

const techAdvisorSchema = new mongoose.Schema({
  recommendedFrontend: {
    type: [String],
    default: []
  },
  recommendedBackend: {
    type: [String],
    default: []
  },
  recommendedDatabase: {
    type: [String],
    default: []
  },
  deploymentSuggestions: {
    type: [String],
    default: []
  }
}, { _id: false });

// ─── Interview Questions Schemas ─────────────────────────────────────────────
const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: "" }
}, { _id: false });

const interviewCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  questions: { type: [interviewQuestionSchema], default: [] }
}, { _id: false });

// ─── Documentation Schema ────────────────────────────────────────────────────
const documentationSchema = new mongoose.Schema({
  readme: { type: String, default: "" },
  installationGuide: { type: String, default: "" },
  projectOverview: { type: String, default: "" },
  architectureDocumentation: { type: String, default: "" },
  apiDocumentation: { type: String, default: "" },
  databaseDocumentation: { type: String, default: "" },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

// ─── GitHub Planner Schema ───────────────────────────────────────────────────
const githubIssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, default: "" },
  labels: { type: [String], default: [] }
}, { _id: false });

const githubMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  dueDate: { type: String, default: "" }
}, { _id: false });

const githubCommitSchema = new mongoose.Schema({
  message: { type: String, required: true },
  description: { type: String, default: "" }
}, { _id: false });

const githubPlannerSchema = new mongoose.Schema({
  readme: { type: String, default: "" },
  folderStructure: { type: [String], default: [] },
  commitPlan: { type: [githubCommitSchema], default: [] },
  milestones: { type: [githubMilestoneSchema], default: [] },
  issues: { type: [githubIssueSchema], default: [] },
  labels: { type: [String], default: [] },
  projectBoardPlan: { type: String, default: "" },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

// ─── Learning Roadmap Schema ─────────────────────────────────────────────────
const learningTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const learningSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topics: { type: [learningTopicSchema], default: [] },
  estimatedHours: { type: Number, default: 0 }
}, { _id: false });

const learningRoadmapSchema = new mongoose.Schema({
  sections: { type: [learningSectionSchema], default: [] },
  totalEstimatedHours: { type: Number, default: 0 },
  difficultyBreakdown: {
    beginner: { type: Number, default: 0 },
    intermediate: { type: Number, default: 0 },
    advanced: { type: Number, default: 0 }
  },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

// ─── Recruiter Analysis Schema ───────────────────────────────────────────────
const recruiterAnalysisSchema = new mongoose.Schema({
  recruiterScore: { type: Number, default: 0, min: 0, max: 100 },
  resumeImpact: { type: Number, default: 0, min: 0, max: 100 },
  interviewDifficulty: { type: String, default: "Medium" },
  skillDemonstration: { type: Number, default: 0, min: 0, max: 100 },
  portfolioStrength: { type: Number, default: 0, min: 0, max: 100 },
  marketDemand: { type: Number, default: 0, min: 0, max: 100 },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  hiringManagerNotes: { type: String, default: "" },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

// ─── Architecture Diagram Schemas ────────────────────────────────────────────
const architectureNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const architectureEdgeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  target: { type: String, required: true }
}, { _id: false });

// ─── Generation Status Schema ────────────────────────────────────────────────
const generationStatusSchema = new mongoose.Schema({
  documentation: { type: String, enum: ["not_generated", "generating", "generated"], default: "not_generated" },
  githubPlanner: { type: String, enum: ["not_generated", "generating", "generated"], default: "not_generated" },
  learningRoadmap: { type: String, enum: ["not_generated", "generating", "generated"], default: "not_generated" },
  recruiterAnalysis: { type: String, enum: ["not_generated", "generating", "generated"], default: "not_generated" }
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: [(value) => value.length > 0, "At least one skill is required"],
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    features: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    estimatedTime: {
      type: String,
      default: "4-6 weeks",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    architecture: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["gemini", "template"],
      default: "template",
    },
    sourceType: {
      type: String,
      enum: ["generated", "analyzed"],
      default: "generated",
    },
    databaseSchema: {
      type: [databaseSchemaSchema],
      default: [],
    },
    apiEndpoints: {
      type: [apiEndpointSchema],
      default: [],
    },
    folderStructure: {
      type: [String],
      default: [],
    },
    roadmap: {
      type: [String],
      default: [],
    },
    resumePoints: {
      type: [String],
      default: [],
    },
    complexityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    resumeBullets: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    alternatives: {
      type: [alternativeSchema],
      default: [],
    },
    techAdvisor: {
      type: techAdvisorSchema,
      default: () => ({
        recommendedFrontend: [],
        recommendedBackend: [],
        recommendedDatabase: [],
        deploymentSuggestions: []
      })
    },
    // ─── Feature 2: Versioning ─────────────────────────────────────────────
    parentProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    versionNumber: {
      type: Number,
      default: 1,
    },
    // ─── Feature 4: Shareable Links ────────────────────────────────────────
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // ─── Feature 5: Interview Questions ────────────────────────────────────
    interviewQuestions: {
      type: [interviewCategorySchema],
      default: [],
    },
    // ─── Feature 6: Documentation ──────────────────────────────────────────
    documentation: {
      type: documentationSchema,
      default: null,
    },
    // ─── Feature 7: GitHub Planner ─────────────────────────────────────────
    githubPlanner: {
      type: githubPlannerSchema,
      default: null,
    },
    // ─── Feature 8: Learning Roadmap ───────────────────────────────────────
    learningRoadmap: {
      type: learningRoadmapSchema,
      default: null,
    },
    // ─── Feature 9: Recruiter Analysis ─────────────────────────────────────
    recruiterAnalysis: {
      type: recruiterAnalysisSchema,
      default: null,
    },
    // ─── Architecture Diagram (dynamic) ─────────────────────────────────────
    architectureNodes: {
      type: [architectureNodeSchema],
      default: [],
    },
    architectureEdges: {
      type: [architectureEdgeSchema],
      default: [],
    },
    // ─── Lazy Generation Status ─────────────────────────────────────────────
    generationStatus: {
      type: generationStatusSchema,
      default: () => ({
        documentation: "not_generated",
        githubPlanner: "not_generated",
        learningRoadmap: "not_generated",
        recruiterAnalysis: "not_generated"
      })
    },
  },
  {
    versionKey: false,
  },
);

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ shareId: 1 }, { sparse: true, unique: true });
projectSchema.index({ parentProjectId: 1 });

export default mongoose.model("Project", projectSchema);
