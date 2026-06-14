import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  detectStack,
  buildTechStack,
  buildArchitecture,
  buildDatabaseSchema,
  buildApiEndpoints,
  buildFolderStructure,
  buildResumePoints,
  buildResumeBullets,
  buildTechAdvisor,
  buildArchitectureDiagram,
} from "./projectGenerator.service.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateProjectWithGemini({
  skills,
  domain,
  difficulty
}) {
  const detectedStack = detectStack(skills);
  const primarySkills = skills.join(", ");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const prompt = `
You are a senior software architect and project advisor.

Generate a COMPLETE software project idea tailored to the user's skills.

User Skills: ${primarySkills}
Domain: ${domain}
Difficulty: ${difficulty}

CRITICAL RULES:
- The project MUST use the user's skills as the PRIMARY technology stack.
- Do NOT include technologies unrelated to the user's skills unless they are standard complementary tools.
- Architecture, database schema, folder structure, and API endpoints MUST be appropriate for the user's chosen stack.
- For example, if the user knows Java/Spring Boot, use Java ecosystem patterns (controllers, services, repositories, Maven).
- If the user knows Python/Django, use Django patterns (apps, models, views, migrations).
- If the user knows React/Node.js, use JavaScript ecosystem patterns.
- Never default to a specific stack (like MERN) unless the user's skills match it.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT wrap in \`\`\`.
Do NOT add explanations.
Every field must contain data.
Features must contain at least 6 items.
Tech stack must contain at least 6 items and MUST include the user's skills.
Database schema must contain at least 2 tables/collections appropriate for the stack.
API endpoints must contain at least 6 endpoints.
Folder structure must contain at least 10 paths appropriate for the stack.
Roadmap must contain at least 8 steps.
Resume points must contain at least 6 points referencing the actual tech stack used.
Complexity score must be between 0-100.
Resume bullets must be ATS-friendly with quantified achievements referencing actual technologies.
Improvements should be actionable suggestions.
Alternatives should be 3 different project ideas in the same domain.

Return this exact structure:

{
  "title": "Project title as string",
  "description": "Detailed project description as string",
  "features": ["feature 1", "feature 2", "..."],
  "techStack": ["${skills[0]}", "${skills[1] || skills[0]}", "...related technologies based on user skills"],
  "estimatedTime": "Time estimate as string (e.g., '4-6 weeks')",
  "architecture": "Architecture description matching the user's tech stack",
  "complexityScore": 75,
  "databaseSchema": [
    {
      "collection": "Table or collection name",
      "fields": [
        {
          "name": "field name",
          "type": "field type appropriate for the stack",
          "description": "field description"
        }
      ]
    }
  ],
  "apiEndpoints": [
    {
      "method": "HTTP method",
      "endpoint": "/api/path",
      "description": "endpoint description"
    }
  ],
  "folderStructure": ["path/to/folder appropriate for stack", "..."],
  "roadmap": ["step 1", "step 2", "..."],
  "resumePoints": ["point referencing actual stack", "..."],
  "resumeBullets": [
    "ATS-friendly bullet with quantified achievement referencing actual technologies",
    "..."
  ],
  "improvements": [
    "Actionable improvement suggestion",
    "..."
  ],
  "alternatives": [
    {
      "title": "Alternative project title",
      "description": "Brief description",
      "difficulty": "Same or similar difficulty"
    }
  ],
  "techAdvisor": {
    "recommendedFrontend": ["Frontend tech matching user skills", "..."],
    "recommendedBackend": ["Backend tech matching user skills", "..."],
    "recommendedDatabase": ["Database matching user skills", "..."],
    "deploymentSuggestions": ["Deployment suggestion", "..."]
  },
  "architectureNodes": [
    { "id": "frontend", "label": "Frontend\\n(Actual Frontend Tech)" },
    { "id": "backend", "label": "Backend API\\n(Actual Backend Tech)" },
    { "id": "database", "label": "Database\\n(Actual DB Tech)" },
    { "id": "auth", "label": "Authentication\\n(Actual Auth)" }
  ],
  "architectureEdges": [
    { "source": "frontend", "target": "backend" },
    { "source": "backend", "target": "database" },
    { "source": "auth", "target": "frontend" }
  ]
}
`;

  let result;
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Gemini Attempt ${attempt}/${maxAttempts}`);
      result = await model.generateContent(prompt);

      if (!result || !result.response) {
        throw new Error("Empty response from Gemini");
      }

      break;
    } catch (error) {
      console.error(`Gemini Attempt ${attempt} Failed:`, error.message);

      if (attempt === maxAttempts) {
        throw new Error(`Gemini failed after ${maxAttempts} attempts: ${error.message}`);
      }

      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  let text;
  try {
    text = result.response.text();
  } catch (err) {
    throw new Error(`Failed to extract text from Gemini response: ${err.message}`);
  }

  console.log("\n=== RAW GEMINI RESPONSE ===");
  console.log(text);
  console.log("=== END RAW RESPONSE ===\n");

  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned empty or invalid response");
  }

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/^\s*json\s*/i, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse Error:", err.message);
    console.error("Cleaned text that failed to parse:", cleaned.substring(0, 500));
    throw new Error("Gemini returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Gemini returned non-object JSON");
  }

  console.log("\n=== PARSED GEMINI OBJECT ===");
  console.log(JSON.stringify(parsed, null, 2));
  console.log("=== END PARSED OBJECT ===\n");

  // ─── Validate and apply skill-aware fallbacks ──────────────────────────

  parsed.title = parsed.title && typeof parsed.title === "string" && parsed.title.trim()
    ? parsed.title.trim()
    : `${domain} Project - ${difficulty} Level`;

  parsed.description = parsed.description && typeof parsed.description === "string" && parsed.description.trim()
    ? parsed.description.trim()
    : `A ${difficulty.toLowerCase()} ${domain} project built with ${skills.slice(0, 3).join(", ")}`;

  parsed.estimatedTime = parsed.estimatedTime && typeof parsed.estimatedTime === "string" && parsed.estimatedTime.trim()
    ? parsed.estimatedTime.trim()
    : difficulty === "Beginner" ? "3-4 weeks" : difficulty === "Intermediate" ? "4-6 weeks" : "6-8 weeks";

  parsed.architecture = parsed.architecture && typeof parsed.architecture === "string" && parsed.architecture.trim()
    ? parsed.architecture.trim()
    : buildArchitecture(domain, skills, detectedStack);

  parsed.features = Array.isArray(parsed.features) && parsed.features.length >= 6
    ? parsed.features.filter(f => typeof f === "string" && f.trim()).slice(0, 15)
    : [
        "User Authentication & Authorization",
        "Interactive Dashboard",
        "CRUD Operations",
        "Advanced Search & Filtering",
        "Real-time Notifications",
        "Analytics & Reporting",
        "File Upload & Management",
        "Role-based Access Control"
      ];

  parsed.techStack = Array.isArray(parsed.techStack) && parsed.techStack.length >= 6
    ? parsed.techStack.filter(t => typeof t === "string" && t.trim()).slice(0, 15)
    : buildTechStack(skills, detectedStack);

  parsed.databaseSchema = Array.isArray(parsed.databaseSchema) && parsed.databaseSchema.length >= 2
    ? parsed.databaseSchema.map(schema => ({
        collection: schema.collection && typeof schema.collection === "string" ? schema.collection : "Collection",
        fields: Array.isArray(schema.fields)
          ? schema.fields.map(field => {
              if (typeof field === "string") {
                return { name: field, type: "String", description: `${field} field` };
              }
              return {
                name: field.name && typeof field.name === "string" ? field.name : "field",
                type: field.type && typeof field.type === "string" ? field.type : "String",
                description: field.description && typeof field.description === "string" ? field.description : "Field description"
              };
            })
          : [{ name: "id", type: "String", description: "Unique identifier" }]
      }))
    : buildDatabaseSchema(detectedStack);

  parsed.apiEndpoints = Array.isArray(parsed.apiEndpoints) && parsed.apiEndpoints.length >= 6
    ? parsed.apiEndpoints.map(ep => ({
        method: ep.method && typeof ep.method === "string" ? ep.method.toUpperCase() : "GET",
        endpoint: ep.endpoint && typeof ep.endpoint === "string" ? ep.endpoint : "/api/resource",
        description: ep.description && typeof ep.description === "string" ? ep.description : "API endpoint"
      }))
    : buildApiEndpoints(detectedStack);

  parsed.folderStructure = Array.isArray(parsed.folderStructure) && parsed.folderStructure.length >= 10
    ? parsed.folderStructure.filter(f => typeof f === "string" && f.trim()).slice(0, 25)
    : buildFolderStructure(detectedStack);

  parsed.roadmap = Array.isArray(parsed.roadmap) && parsed.roadmap.length >= 8
    ? parsed.roadmap.filter(r => typeof r === "string" && r.trim()).slice(0, 20)
    : [
        "Project Setup & Environment Configuration",
        "Database Schema Design & Migration Setup",
        "Backend API Development & Route Implementation",
        "Authentication & Authorization Implementation",
        "Frontend Component Development & State Management",
        "API Integration & Data Fetching",
        "Testing & Quality Assurance",
        "Performance Optimization & Caching",
        "Docker Containerization & CI/CD Setup",
        "Deployment, Monitoring & Documentation"
      ];

  parsed.resumePoints = Array.isArray(parsed.resumePoints) && parsed.resumePoints.length >= 6
    ? parsed.resumePoints.filter(r => typeof r === "string" && r.trim()).slice(0, 12)
    : buildResumePoints(skills, domain, difficulty, detectedStack);

  parsed.complexityScore = typeof parsed.complexityScore === "number" && parsed.complexityScore >= 0 && parsed.complexityScore <= 100
    ? Math.round(parsed.complexityScore)
    : difficulty === "Beginner" ? 35 : difficulty === "Intermediate" ? 65 : 85;

  parsed.resumeBullets = Array.isArray(parsed.resumeBullets) && parsed.resumeBullets.length >= 6
    ? parsed.resumeBullets.filter(b => typeof b === "string" && b.trim()).slice(0, 10)
    : buildResumeBullets(skills, domain, difficulty, detectedStack);

  parsed.improvements = Array.isArray(parsed.improvements) && parsed.improvements.length >= 4
    ? parsed.improvements.filter(i => typeof i === "string" && i.trim()).slice(0, 8)
    : [
        "Add caching layer to improve API response times by 50%",
        "Implement role-based access control (RBAC) for granular permissions",
        "Add comprehensive unit and integration testing suite",
        "Set up Docker containerization for consistent development and deployment",
        "Implement real-time features for live updates",
        "Add rate limiting and request throttling to prevent API abuse"
      ];

  parsed.alternatives = Array.isArray(parsed.alternatives) && parsed.alternatives.length >= 3
    ? parsed.alternatives.map(alt => ({
        title: alt.title && typeof alt.title === "string" ? alt.title : "Alternative Project",
        description: alt.description && typeof alt.description === "string" ? alt.description : "Alternative project description",
        difficulty: alt.difficulty && typeof alt.difficulty === "string" ? alt.difficulty : difficulty
      })).slice(0, 5)
    : [
        {
          title: `${domain} Analytics Dashboard`,
          description: `A data visualization platform for ${domain.toLowerCase()} metrics and insights`,
          difficulty: difficulty
        },
        {
          title: `${domain} Collaboration Tool`,
          description: `A team collaboration platform for ${domain.toLowerCase()} workflows`,
          difficulty: difficulty
        },
        {
          title: `${domain} Resource Manager`,
          description: `A resource tracking and management system for ${domain.toLowerCase()} projects`,
          difficulty: difficulty
        }
      ];

  const techAdvisor = parsed.techAdvisor && typeof parsed.techAdvisor === "object" ? parsed.techAdvisor : {};
  const defaultAdvisor = buildTechAdvisor(skills, detectedStack);
  parsed.techAdvisor = {
    recommendedFrontend: Array.isArray(techAdvisor.recommendedFrontend) && techAdvisor.recommendedFrontend.length > 0
      ? techAdvisor.recommendedFrontend.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedFrontend,
    recommendedBackend: Array.isArray(techAdvisor.recommendedBackend) && techAdvisor.recommendedBackend.length > 0
      ? techAdvisor.recommendedBackend.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedBackend,
    recommendedDatabase: Array.isArray(techAdvisor.recommendedDatabase) && techAdvisor.recommendedDatabase.length > 0
      ? techAdvisor.recommendedDatabase.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedDatabase,
    deploymentSuggestions: Array.isArray(techAdvisor.deploymentSuggestions) && techAdvisor.deploymentSuggestions.length > 0
      ? techAdvisor.deploymentSuggestions.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.deploymentSuggestions
  };

  // ─── Validate architectureNodes/Edges ─────────────────────────────────────
  const defaultDiagram = buildArchitectureDiagram(skills, detectedStack);

  parsed.architectureNodes = Array.isArray(parsed.architectureNodes) && parsed.architectureNodes.length >= 3
    ? parsed.architectureNodes
        .filter(n => n && typeof n.id === "string" && typeof n.label === "string")
        .slice(0, 10)
    : defaultDiagram.architectureNodes;

  parsed.architectureEdges = Array.isArray(parsed.architectureEdges) && parsed.architectureEdges.length >= 2
    ? parsed.architectureEdges
        .filter(e => e && typeof e.source === "string" && typeof e.target === "string")
        .slice(0, 15)
    : defaultDiagram.architectureEdges;

  console.log("\n=== FINAL OBJECT BEFORE SAVE ===");
  console.log(JSON.stringify(parsed, null, 2));
  console.log("=== END FINAL OBJECT ===\n");

  return parsed;
}

// ─── Analyze Existing Project with Gemini ──────────────────────────────────

export async function analyzeProjectWithGemini({ projectName }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const prompt = `
You are a senior software architect and project advisor.

The user has an EXISTING project concept they want analyzed.
Your job is to produce a COMPLETE professional software blueprint for this project.

Project Name: ${projectName}

CRITICAL RULES:
- Treat this as an already-existing project idea, not something you are inventing.
- Choose the most appropriate technology stack for THIS specific project.
- Do NOT default to any particular stack. Pick whatever best fits the project's domain and requirements.
- Architecture, database schema, folder structure, and API endpoints MUST be appropriate for the chosen stack.
- For example, a "Hostel Management System" might use Java/Spring Boot + MySQL, or Python/Django + PostgreSQL.
- A "Real-time Chat App" might use Node.js/Socket.io + MongoDB, or Go + Redis + PostgreSQL.
- An "AI Resume Analyzer" might use Python/FastAPI + React + PostgreSQL.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT wrap in \`\`\`.
Do NOT add explanations.
Every field must contain data.
Features must contain at least 6 items.
Tech stack must contain at least 6 items appropriate for this project.
Database schema must contain at least 2 tables/collections.
API endpoints must contain at least 6 endpoints.
Folder structure must contain at least 10 paths.
Roadmap must contain at least 8 steps.
Resume points must contain at least 6 points referencing the actual tech stack.
Complexity score must be between 0-100.
Resume bullets must be ATS-friendly with quantified achievements.
Improvements should be actionable suggestions.
Alternatives should be 3 similar projects in the same domain.
For all alternative projects, difficulty must be one of:

- Beginner
- Intermediate
- Advanced

Never use:
- Low
- Medium
- High

Return this exact structure:

{
  "title": "${projectName}",
  "description": "Detailed description of what this project does and its purpose",
  "features": ["feature 1", "feature 2", "..."],
  "techStack": ["tech 1", "tech 2", "..."],
  "estimatedTime": "Time estimate as string",
  "architecture": "Architecture description matching the chosen tech stack",
  "complexityScore": 65,
  "databaseSchema": [
    {
      "collection": "Table or collection name",
      "fields": [
        {
          "name": "field name",
          "type": "field type",
          "description": "field description"
        }
      ]
    }
  ],
  "apiEndpoints": [
    {
      "method": "HTTP method",
      "endpoint": "/api/path",
      "description": "endpoint description"
    }
  ],
  "folderStructure": ["path/to/folder", "..."],
  "roadmap": ["step 1", "step 2", "..."],
  "resumePoints": ["point referencing actual stack", "..."],
  "resumeBullets": [
    "ATS-friendly bullet with quantified achievement",
    "..."
  ],
  "improvements": ["actionable suggestion", "..."],
  "alternatives": [
    {
      "title": "Similar project idea",
      "description": "Brief description",
      "difficulty": "Similar difficulty"
    }
  ],
  "techAdvisor": {
    "recommendedFrontend": ["Frontend tech for this project", "..."],
    "recommendedBackend": ["Backend tech for this project", "..."],
    "recommendedDatabase": ["Database for this project", "..."],
    "deploymentSuggestions": ["Deployment suggestion", "..."]
  },
  "architectureNodes": [
    { "id": "frontend", "label": "Frontend\\n(Actual Frontend Tech)" },
    { "id": "backend", "label": "Backend API\\n(Actual Backend Tech)" },
    { "id": "database", "label": "Database\\n(Actual DB Tech)" },
    { "id": "auth", "label": "Authentication\\n(Actual Auth)" }
  ],
  "architectureEdges": [
    { "source": "frontend", "target": "backend" },
    { "source": "backend", "target": "database" },
    { "source": "auth", "target": "frontend" }
  ]
}
`;

  let result;
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Analyze Gemini Attempt ${attempt}/${maxAttempts}`);
      result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Empty response from Gemini");
      }
      break;
    } catch (error) {
      console.error(`Analyze Gemini Attempt ${attempt} Failed:`, error.message);
      if (attempt === maxAttempts) {
        throw new Error(`Gemini failed after ${maxAttempts} attempts: ${error.message}`);
      }
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  let text;
  try {
    text = result.response.text();
  } catch (err) {
    throw new Error(`Failed to extract text: ${err.message}`);
  }

  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned empty response");
  }

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/^\s*json\s*/i, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Gemini returned non-object JSON");
  }

  // ─── Validate fields (same pattern as generateProjectWithGemini) ─────────

  parsed.title = parsed.title && typeof parsed.title === "string" && parsed.title.trim()
    ? parsed.title.trim()
    : projectName;

  parsed.description = parsed.description && typeof parsed.description === "string" && parsed.description.trim()
    ? parsed.description.trim()
    : `A comprehensive ${projectName} application with modern architecture and best practices.`;

  parsed.estimatedTime = parsed.estimatedTime && typeof parsed.estimatedTime === "string" && parsed.estimatedTime.trim()
    ? parsed.estimatedTime.trim()
    : "4-6 weeks";

  parsed.features = Array.isArray(parsed.features) && parsed.features.length >= 6
    ? parsed.features.filter(f => typeof f === "string" && f.trim()).slice(0, 15)
    : [
        "User Authentication & Authorization",
        "Interactive Dashboard",
        "CRUD Operations",
        "Advanced Search & Filtering",
        "Real-time Notifications",
        "Analytics & Reporting"
      ];

  parsed.techStack = Array.isArray(parsed.techStack) && parsed.techStack.length >= 6
    ? parsed.techStack.filter(t => typeof t === "string" && t.trim()).slice(0, 15)
    : ["HTML", "CSS", "JavaScript", "Node.js", "Express.js", "MongoDB"];

  const skills = parsed.techStack || [];
  const detectedStack = detectStack(skills);

  parsed.architecture = parsed.architecture && typeof parsed.architecture === "string" && parsed.architecture.trim()
    ? parsed.architecture.trim()
    : buildArchitecture("General", skills, detectedStack);

  parsed.databaseSchema = Array.isArray(parsed.databaseSchema) && parsed.databaseSchema.length >= 2
    ? parsed.databaseSchema.map(schema => ({
        collection: schema.collection && typeof schema.collection === "string" ? schema.collection : "Collection",
        fields: Array.isArray(schema.fields)
          ? schema.fields.map(field => ({
              name: field.name && typeof field.name === "string" ? field.name : "field",
              type: field.type && typeof field.type === "string" ? field.type : "String",
              description: field.description && typeof field.description === "string" ? field.description : "Field description"
            }))
          : [{ name: "id", type: "String", description: "Unique identifier" }]
      }))
    : buildDatabaseSchema(detectedStack);

  parsed.apiEndpoints = Array.isArray(parsed.apiEndpoints) && parsed.apiEndpoints.length >= 6
    ? parsed.apiEndpoints.map(ep => ({
        method: ep.method && typeof ep.method === "string" ? ep.method.toUpperCase() : "GET",
        endpoint: ep.endpoint && typeof ep.endpoint === "string" ? ep.endpoint : "/api/resource",
        description: ep.description && typeof ep.description === "string" ? ep.description : "API endpoint"
      }))
    : buildApiEndpoints(detectedStack);

  parsed.folderStructure = Array.isArray(parsed.folderStructure) && parsed.folderStructure.length >= 10
    ? parsed.folderStructure.filter(f => typeof f === "string" && f.trim()).slice(0, 25)
    : buildFolderStructure(detectedStack);

  parsed.roadmap = Array.isArray(parsed.roadmap) && parsed.roadmap.length >= 8
    ? parsed.roadmap.filter(r => typeof r === "string" && r.trim()).slice(0, 20)
    : [
        "Project Setup & Environment Configuration",
        "Database Schema Design & Migration Setup",
        "Backend API Development & Route Implementation",
        "Authentication & Authorization Implementation",
        "Frontend Component Development & State Management",
        "API Integration & Data Fetching",
        "Testing & Quality Assurance",
        "Deployment, Monitoring & Documentation"
      ];

  parsed.resumePoints = Array.isArray(parsed.resumePoints) && parsed.resumePoints.length >= 6
    ? parsed.resumePoints.filter(r => typeof r === "string" && r.trim()).slice(0, 12)
    : buildResumePoints(skills, "General", "Intermediate", detectedStack);

  parsed.complexityScore = typeof parsed.complexityScore === "number" && parsed.complexityScore >= 0 && parsed.complexityScore <= 100
    ? Math.round(parsed.complexityScore)
    : 65;

  parsed.resumeBullets = Array.isArray(parsed.resumeBullets) && parsed.resumeBullets.length >= 6
    ? parsed.resumeBullets.filter(b => typeof b === "string" && b.trim()).slice(0, 10)
    : buildResumeBullets(skills, "General", "Intermediate", detectedStack);

  parsed.improvements = Array.isArray(parsed.improvements) && parsed.improvements.length >= 4
    ? parsed.improvements.filter(i => typeof i === "string" && i.trim()).slice(0, 8)
    : [
        "Add caching layer to improve API response times",
        "Implement role-based access control (RBAC)",
        "Add comprehensive unit and integration testing suite",
        "Set up Docker containerization for deployment"
      ];

  parsed.alternatives = Array.isArray(parsed.alternatives) && parsed.alternatives.length >= 3
    ? parsed.alternatives.map(alt => ({
        title: alt.title && typeof alt.title === "string" ? alt.title : "Alternative Project",
        description: alt.description && typeof alt.description === "string" ? alt.description : "Alternative project description",
        difficulty: alt.difficulty && typeof alt.difficulty === "string" ? alt.difficulty : "Intermediate"
      })).slice(0, 5)
    : [
        { title: `${projectName} Pro`, description: `An enhanced version of ${projectName} with advanced features`, difficulty: "Advanced" },
        { title: `${projectName} Lite`, description: `A simplified version of ${projectName} for quick deployment`, difficulty: "Beginner" },
        { title: `${projectName} API`, description: `A headless API-first version of ${projectName}`, difficulty: "Intermediate" }
      ];

  const techAdvisor = parsed.techAdvisor && typeof parsed.techAdvisor === "object" ? parsed.techAdvisor : {};
  const defaultAdvisor = buildTechAdvisor(skills, detectedStack);
  parsed.techAdvisor = {
    recommendedFrontend: Array.isArray(techAdvisor.recommendedFrontend) && techAdvisor.recommendedFrontend.length > 0
      ? techAdvisor.recommendedFrontend.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedFrontend,
    recommendedBackend: Array.isArray(techAdvisor.recommendedBackend) && techAdvisor.recommendedBackend.length > 0
      ? techAdvisor.recommendedBackend.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedBackend,
    recommendedDatabase: Array.isArray(techAdvisor.recommendedDatabase) && techAdvisor.recommendedDatabase.length > 0
      ? techAdvisor.recommendedDatabase.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.recommendedDatabase,
    deploymentSuggestions: Array.isArray(techAdvisor.deploymentSuggestions) && techAdvisor.deploymentSuggestions.length > 0
      ? techAdvisor.deploymentSuggestions.filter(t => typeof t === "string").slice(0, 8)
      : defaultAdvisor.deploymentSuggestions
  };

  // ─── Validate architectureNodes/Edges ─────────────────────────────────────
  const defaultDiagram = buildArchitectureDiagram(skills, detectedStack);

  parsed.architectureNodes = Array.isArray(parsed.architectureNodes) && parsed.architectureNodes.length >= 3
    ? parsed.architectureNodes
        .filter(n => n && typeof n.id === "string" && typeof n.label === "string")
        .slice(0, 10)
    : defaultDiagram.architectureNodes;

  parsed.architectureEdges = Array.isArray(parsed.architectureEdges) && parsed.architectureEdges.length >= 2
    ? parsed.architectureEdges
        .filter(e => e && typeof e.source === "string" && typeof e.target === "string")
        .slice(0, 15)
    : defaultDiagram.architectureEdges;

  return parsed;
}
