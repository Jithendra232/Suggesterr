import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function callGemini(prompt, maxAttempts = 2) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response?.text();
      if (!text) throw new Error("Empty Gemini response");
      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`Gemini attempt ${attempt} failed:`, err.message);
      if (attempt === maxAttempts) throw err;
    }
  }
}

// ─── Feature 5: Interview Questions ──────────────────────────────────────────

export async function generateInterviewQuestions(project) {
  const prompt = `You are an expert technical interviewer. Generate interview questions for this project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}
Difficulty: ${project.difficulty}

Generate questions in these exact 5 categories with 5 questions each. Return valid JSON:
[
  {
    "category": "HR Questions",
    "questions": [{"question": "...", "answer": "..."}]
  },
  {
    "category": "Technical Questions",
    "questions": [{"question": "...", "answer": "..."}]
  },
  {
    "category": "Database Questions",
    "questions": [{"question": "...", "answer": "..."}]
  },
  {
    "category": "System Design Questions",
    "questions": [{"question": "...", "answer": "..."}]
  },
  {
    "category": "Architecture Questions",
    "questions": [{"question": "...", "answer": "..."}]
  }
]`;

  try {
    const result = await callGemini(prompt);
    if (Array.isArray(result) && result.length > 0) return result;
  } catch (err) {
    console.error("Interview questions generation failed:", err.message);
  }

  // Fallback
  return [
    { category: "HR Questions", questions: [
      { question: "Tell me about this project and your role in it.", answer: "" },
      { question: "What challenges did you face during development?", answer: "" },
      { question: "How did you manage time and priorities?", answer: "" },
      { question: "What would you do differently next time?", answer: "" },
      { question: "How does this project demonstrate teamwork?", answer: "" }
    ]},
    { category: "Technical Questions", questions: [
      { question: `Explain the architecture of ${project.title}.`, answer: "" },
      { question: `Why did you choose ${project.techStack?.[0] || "this tech stack"}?`, answer: "" },
      { question: "How do you handle error cases?", answer: "" },
      { question: "Describe your authentication approach.", answer: "" },
      { question: "How would you scale this application?", answer: "" }
    ]},
    { category: "Database Questions", questions: [
      { question: "Describe your database schema design.", answer: "" },
      { question: "How do you handle database relationships?", answer: "" },
      { question: "What indexing strategy did you use?", answer: "" },
      { question: "How do you handle data migrations?", answer: "" },
      { question: "Explain your approach to data validation.", answer: "" }
    ]},
    { category: "System Design Questions", questions: [
      { question: "How would you design this system from scratch?", answer: "" },
      { question: "What are the key components and how do they interact?", answer: "" },
      { question: "How would you handle 10x more users?", answer: "" },
      { question: "Describe your caching strategy.", answer: "" },
      { question: "How would you ensure high availability?", answer: "" }
    ]},
    { category: "Architecture Questions", questions: [
      { question: "Why did you choose this architectural pattern?", answer: "" },
      { question: "How are concerns separated in your codebase?", answer: "" },
      { question: "Describe your API design philosophy.", answer: "" },
      { question: "How do you handle cross-cutting concerns?", answer: "" },
      { question: "What design patterns did you use?", answer: "" }
    ]}
  ];
}

// ─── Feature 6: Documentation ────────────────────────────────────────────────

export async function generateDocumentation(project) {
  const prompt = `You are a technical documentation expert. Generate comprehensive documentation for this project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}
Domain: ${project.domain}
API Endpoints: ${project.apiEndpoints?.map(e => `${e.method} ${e.endpoint}`).join(", ")}
Database Collections: ${project.databaseSchema?.map(s => s.collection).join(", ")}

Return valid JSON with these exact keys:
{
  "readme": "Full README.md content",
  "installationGuide": "Step-by-step installation guide",
  "projectOverview": "Project overview and purpose",
  "architectureDocumentation": "Architecture documentation",
  "apiDocumentation": "API documentation with endpoints",
  "databaseDocumentation": "Database schema documentation"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Documentation generation failed:", err.message);
  }

  // Fallback
  return {
    readme: `# ${project.title}\n\n${project.description}\n\n## Tech Stack\n${project.techStack?.join(", ")}\n\n## Features\n${project.features?.map(f => `- ${f}`).join("\n")}`,
    installationGuide: `# Installation Guide\n\n1. Clone the repository\n2. Install dependencies: npm install\n3. Set up environment variables\n4. Run: npm start`,
    projectOverview: `# Project Overview\n\n${project.description}\n\nDomain: ${project.domain}\nDifficulty: ${project.difficulty}\nEstimated Time: ${project.estimatedTime}`,
    architectureDocumentation: `# Architecture\n\n${project.architecture || "MVC architecture pattern"}`,
    apiDocumentation: `# API Documentation\n\n${project.apiEndpoints?.map(e => `## ${e.method} ${e.endpoint}\n${e.description}`).join("\n\n") || "No API endpoints defined."}`,
    databaseDocumentation: `# Database Documentation\n\n${project.databaseSchema?.map(s => `## ${s.collection}\n${s.fields?.map(f => `- ${f.name} (${f.type}): ${f.description}`).join("\n")}`).join("\n\n") || "No database schema defined."}`
  };
}

// ─── Feature 7: GitHub Planner ───────────────────────────────────────────────

export async function generateGitHubPlanner(project) {
  const prompt = `You are a GitHub repository management expert. Create a complete repository plan for this project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}
Folder Structure: ${project.folderStructure?.join(", ")}

Return valid JSON:
{
  "readme": "Complete README.md content for GitHub",
  "folderStructure": ["src/", "src/components/", "..."],
  "commitPlan": [{"message": "feat: initial setup", "description": "..."}],
  "milestones": [{"title": "MVP", "description": "..."}],
  "issues": [{"title": "Setup CI/CD", "labels": ["enhancement"]}],
  "labels": ["bug", "enhancement", "documentation", "good first issue"],
  "projectBoardPlan": "Description of the project board columns and workflow"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("GitHub planner generation failed:", err.message);
  }

  // Fallback
  return {
    readme: `# ${project.title}\n\n${project.description}\n\n## Getting Started\n\n\`\`\`bash\ngit clone <repo>\ncd ${project.title.toLowerCase().replace(/\s+/g, "-")}\nnpm install\nnpm start\n\`\`\``,
    folderStructure: project.folderStructure || ["src/", "public/", "package.json"],
    commitPlan: [
      { message: "feat: initial project setup", description: "Create project structure and config files" },
      { message: "feat: add core features", description: "Implement main functionality" },
      { message: "feat: add UI components", description: "Build frontend components" },
      { message: "fix: resolve bugs", description: "Fix known issues" },
      { message: "docs: add documentation", description: "Complete README and API docs" }
    ],
    milestones: [
      { title: "Phase 1: Setup", description: "Project initialization and basic structure" },
      { title: "Phase 2: Core Features", description: "Main functionality implementation" },
      { title: "Phase 3: Polish", description: "Bug fixes, testing, and documentation" }
    ],
    issues: [
      { title: "Setup development environment", labels: ["setup"] },
      { title: "Implement authentication", labels: ["feature"] },
      { title: "Add unit tests", labels: ["testing"] }
    ],
    labels: ["bug", "enhancement", "documentation", "good first issue", "feature", "testing"],
    projectBoardPlan: "Columns: To Do | In Progress | Review | Done"
  };
}

// ─── Feature 8: Learning Roadmap ─────────────────────────────────────────────

export async function generateLearningRoadmap(project) {
  const prompt = `You are a learning roadmap advisor. Create a personalized learning roadmap for building this project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}
Difficulty: ${project.difficulty}

Return valid JSON:
{
  "sections": [
    {
      "title": "Prerequisites",
      "topics": [{"title": "JavaScript basics", "completed": false}],
      "estimatedHours": 10
    },
    {
      "title": "Frontend Topics",
      "topics": [{"title": "...", "completed": false}],
      "estimatedHours": 20
    },
    {
      "title": "Backend Topics",
      "topics": [{"title": "...", "completed": false}],
      "estimatedHours": 20
    },
    {
      "title": "Database Topics",
      "topics": [{"title": "...", "completed": false}],
      "estimatedHours": 10
    },
    {
      "title": "Deployment Topics",
      "topics": [{"title": "...", "completed": false}],
      "estimatedHours": 5
    }
  ],
  "totalEstimatedHours": 65
}`;

  try {
    const result = await callGemini(prompt);
    if (result && result.sections?.length) return result;
  } catch (err) {
    console.error("Learning roadmap generation failed:", err.message);
  }

  // Fallback
  return {
    sections: [
      { title: "Prerequisites", topics: [
        { title: "HTML, CSS, JavaScript fundamentals", completed: false },
        { title: "Git and version control", completed: false },
        { title: "Command line basics", completed: false }
      ], estimatedHours: 15 },
      { title: "Frontend Topics", topics: [
        { title: "React components and JSX", completed: false },
        { title: "State management with hooks", completed: false },
        { title: "Routing with React Router", completed: false },
        { title: "Styling with Tailwind CSS", completed: false }
      ], estimatedHours: 25 },
      { title: "Backend Topics", topics: [
        { title: "Node.js and Express basics", completed: false },
        { title: "REST API design", completed: false },
        { title: "Authentication and authorization", completed: false },
        { title: "Middleware and error handling", completed: false }
      ], estimatedHours: 25 },
      { title: "Database Topics", topics: [
        { title: "MongoDB fundamentals", completed: false },
        { title: "Mongoose ODM", completed: false },
        { title: "Schema design and relationships", completed: false }
      ], estimatedHours: 15 },
      { title: "Deployment Topics", topics: [
        { title: "Environment variables and configuration", completed: false },
        { title: "Deploying to Vercel/Render", completed: false },
        { title: "CI/CD basics", completed: false }
      ], estimatedHours: 10 }
    ],
    totalEstimatedHours: 90
  };
}

// ─── Feature 9: Recruiter Analysis ───────────────────────────────────────────

export async function generateRecruiterAnalysis(project) {
  const prompt = `You are a senior tech recruiter evaluating this project for a candidate's portfolio:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}
Domain: ${project.domain}
Difficulty: ${project.difficulty}
Complexity Score: ${project.complexityScore}

Return valid JSON:
{
  "recruiterScore": 75,
  "resumeImpact": 70,
  "interviewDifficulty": "Medium",
  "skillDemonstration": 80,
  "portfolioStrength": 65,
  "marketDemand": 85,
  "strengths": ["Uses modern tech stack", "..."],
  "weaknesses": ["Could add more tests", "..."],
  "hiringManagerNotes": "This project demonstrates..."
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result.recruiterScore === "number") return result;
  } catch (err) {
    console.error("Recruiter analysis generation failed:", err.message);
  }

  // Fallback
  const score = Math.min(100, Math.max(0, (project.complexityScore || 50) + 10));
  return {
    recruiterScore: score,
    resumeImpact: score - 5,
    interviewDifficulty: project.difficulty === "Advanced" ? "Hard" : project.difficulty === "Intermediate" ? "Medium" : "Easy",
    skillDemonstration: score + 5,
    portfolioStrength: score - 10,
    marketDemand: score + 10,
    strengths: [
      `Demonstrates proficiency in ${project.techStack?.slice(0, 3).join(", ")}`,
      `Shows understanding of ${project.domain} domain`,
      "Includes structured project with clear architecture"
    ],
    weaknesses: [
      "Consider adding unit and integration tests",
      "Could benefit from CI/CD pipeline setup",
      "Add more documentation"
    ],
    hiringManagerNotes: `This project demonstrates the candidate's ability to work with ${project.techStack?.slice(0, 2).join(" and ")}. The ${project.difficulty.toLowerCase()} complexity level shows ${project.difficulty === "Advanced" ? "strong" : project.difficulty === "Intermediate" ? "solid" : "foundational"} engineering skills.`
  };
}
