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

export async function analyzeProjectWithGemini({ projectName, projectDescription }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const descriptionLine = projectDescription && projectDescription.trim()
    ? projectDescription.trim()
    : "Not provided";

  const hasDescription = projectDescription && projectDescription.trim().length > 0;

  const prompt = `
You are a senior software architect and project advisor.

The user has an EXISTING project concept they want analyzed.
Your job is to produce a COMPLETE professional software blueprint for THIS EXACT project.

Project Name: ${projectName}${hasDescription ? `
Project Description: ${descriptionLine}` : ""}

CRITICAL RULES:
- Analyze THIS EXACT PROJECT. Do NOT substitute it with a generic software application.
- Base ALL outputs strictly on the provided project name${hasDescription ? " and description" : ""}.
- Do NOT assume unrelated features. Do NOT replace the project with a generic CRUD application.
${hasDescription ? `- The description is the PRIMARY source of truth. If the description conflicts with assumptions from the title, TRUST THE DESCRIPTION.
- Every feature, API endpoint, database table, roadmap step, and tech stack item MUST be directly relevant to: "${descriptionLine}"` : ""}
- Choose the most appropriate technology stack for THIS specific project's domain and requirements.
- Architecture, database schema, folder structure, and API endpoints MUST reflect the project's actual purpose.
- For example, an "ATS Resume Maker" must include NLP, resume parsing, ATS scoring, job description matching — NOT generic CRUD.
- A "Hostel Management System" uses room booking, occupancy tracking, fee management — NOT generic user management.
- A "Real-time Chat App" uses WebSockets, message queues, presence detection — NOT generic REST CRUD.

QUALITY CHECK:
- Before finalizing, verify: does every section specifically describe "${projectName}" and not a generic application?
- If any section is generic or unrelated to the project, rewrite it to be project-specific.
- Resume bullets, features, roadmap, APIs — ALL must reference the project's actual domain and technical requirements.

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

// ─── Reverse Engineer Real-World Product with Gemini ──────────────────────────
// This function generates ONLY system-design content (no resume/career fields).

export async function reverseEngineerWithGemini({ productName }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const prompt = `
You are a world-class software architect and system design expert.

Reverse engineer the following real-world product from a SYSTEM DESIGN perspective.
This is NOT a student project. Do NOT generate resume content, career advice, or learning roadmaps.
Focus exclusively on professional system architecture, infrastructure, and engineering practices.

Product: ${productName}

CRITICAL RULES:
- Analyze the REAL product "${productName}" as it actually exists in production.
- Focus on how the product is architecturally built at scale.
- Do NOT generate resume bullets, ATS content, recruiter analysis, or alternative project ideas.
- Do NOT generate learning roadmaps or interview questions.
- All content must be from a senior engineer / system design perspective.
- Tech stack must reflect what is actually used (or widely understood to be used) by the real product.
- Scaling strategy must address how the product handles millions of users.
- Infrastructure must describe cloud providers, CDN, load balancers, and deployment strategy.
- API Design must be realistic for the actual product.
- Database design must reflect the real product's data model requirements.
- Security must cover authentication, authorization, encryption, and compliance relevant to the product.
- Data flow must describe the end-to-end journey of a request through the system.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT wrap in \`\`\`.
Do NOT add explanations outside the JSON.
Every field must contain meaningful, product-specific data.

Return this EXACT structure:

{
  "title": "${productName}",
  "description": "Brief overview of what ${productName} is and its core purpose at scale",
  "features": ["Core product feature 1", "Core product feature 2", "..."],
  "techStack": ["Actual or widely-known tech used by ${productName}", "..."],
  "estimatedTime": "N/A - Production System",
  "architecture": "High-level architecture description of ${productName} (microservices, monolith, event-driven, etc.)",
  "complexityScore": 95,
  "architectureExplanationText": "Detailed explanation of the system architecture, including how the components interact and why these design choices were made for ${productName} at scale",
  "systemDesignExplanation": "In-depth system design explanation: data flow, consistency models, CAP theorem tradeoffs, and distributed systems decisions specific to ${productName}",
  "databaseSchema": [
    {
      "collection": "Core entity name",
      "fields": [
        {
          "name": "field name",
          "type": "field type",
          "description": "purpose of this field in ${productName}"
        }
      ]
    }
  ],
  "apiEndpoints": [
    {
      "method": "HTTP method",
      "endpoint": "/api/path",
      "description": "What this endpoint does in ${productName}"
    }
  ],
  "folderStructure": ["service/or/repo/path", "..."],
  "scalingStrategy": ["Scaling approach 1 used by ${productName}", "Scaling approach 2", "..."],
  "securityConsiderations": ["Security measure 1", "Security measure 2", "..."],
  "infrastructure": ["Infrastructure component 1", "Infrastructure component 2", "..."],
  "industryPractices": ["Engineering practice 1", "Engineering practice 2", "..."],
  "deploymentStrategy": "Description of how ${productName} deploys code to production (CI/CD, blue-green, canary, etc.)",
  "dataFlow": "Step-by-step description of how a typical request flows through the ${productName} system from client to response",
  "techAdvisor": {
    "recommendedFrontend": ["Frontend technologies used by ${productName}"],
    "recommendedBackend": ["Backend technologies used by ${productName}"],
    "recommendedDatabase": ["Databases used by ${productName}"],
    "deploymentSuggestions": ["Deployment infrastructure used by ${productName}"]
  },
  "architectureNodes": [
    { "id": "client", "label": "Client Layer\\n(Web / Mobile)" },
    { "id": "cdn", "label": "CDN\\n(CloudFront / Fastly)" },
    { "id": "loadbalancer", "label": "Load Balancer\\n(AWS ALB / Nginx)" },
    { "id": "api", "label": "API Gateway\\n(Kong / AWS API GW)" },
    { "id": "services", "label": "Microservices\\n(Domain Services)" },
    { "id": "database", "label": "Database Layer\\n(Primary DB)" },
    { "id": "cache", "label": "Cache Layer\\n(Redis / Memcached)" },
    { "id": "queue", "label": "Message Queue\\n(Kafka / RabbitMQ)" }
  ],
  "architectureEdges": [
    { "source": "client", "target": "cdn" },
    { "source": "cdn", "target": "loadbalancer" },
    { "source": "loadbalancer", "target": "api" },
    { "source": "api", "target": "services" },
    { "source": "services", "target": "database" },
    { "source": "services", "target": "cache" },
    { "source": "services", "target": "queue" }
  ]
}
`;

  let result;
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Reverse Engineer Gemini Attempt ${attempt}/${maxAttempts}`);
      result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Empty response from Gemini");
      }
      break;
    } catch (error) {
      console.error(`Reverse Engineer Gemini Attempt ${attempt} Failed:`, error.message);
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

  // ─── Validate and sanitize fields ────────────────────────────────────────────

  parsed.title = parsed.title && typeof parsed.title === "string" && parsed.title.trim()
    ? parsed.title.trim()
    : productName;

  parsed.description = parsed.description && typeof parsed.description === "string" && parsed.description.trim()
    ? parsed.description.trim()
    : `${productName} - Production-scale system architecture analysis.`;

  parsed.estimatedTime = "N/A - Production System";

  parsed.features = Array.isArray(parsed.features) && parsed.features.length >= 4
    ? parsed.features.filter(f => typeof f === "string" && f.trim()).slice(0, 15)
    : [`Core ${productName} features`, "High availability", "Horizontal scaling", "Real-time data processing"];

  parsed.techStack = Array.isArray(parsed.techStack) && parsed.techStack.length >= 4
    ? parsed.techStack.filter(t => typeof t === "string" && t.trim()).slice(0, 20)
    : ["Microservices", "Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka"];

  parsed.architecture = parsed.architecture && typeof parsed.architecture === "string" && parsed.architecture.trim()
    ? parsed.architecture.trim()
    : `${productName} uses a distributed microservices architecture designed for massive scale.`;

  parsed.complexityScore = typeof parsed.complexityScore === "number" && parsed.complexityScore >= 0 && parsed.complexityScore <= 100
    ? Math.round(parsed.complexityScore)
    : 95;

  parsed.databaseSchema = Array.isArray(parsed.databaseSchema) && parsed.databaseSchema.length >= 2
    ? parsed.databaseSchema.map(schema => ({
        collection: schema.collection && typeof schema.collection === "string" ? schema.collection : "Entity",
        fields: Array.isArray(schema.fields)
          ? schema.fields.map(field => ({
              name: field.name && typeof field.name === "string" ? field.name : "field",
              type: field.type && typeof field.type === "string" ? field.type : "String",
              description: field.description && typeof field.description === "string" ? field.description : "Field description"
            }))
          : [{ name: "id", type: "UUID", description: "Unique identifier" }]
      }))
    : [];

  parsed.apiEndpoints = Array.isArray(parsed.apiEndpoints) && parsed.apiEndpoints.length >= 4
    ? parsed.apiEndpoints.map(ep => ({
        method: ep.method && typeof ep.method === "string" ? ep.method.toUpperCase() : "GET",
        endpoint: ep.endpoint && typeof ep.endpoint === "string" ? ep.endpoint : "/api/resource",
        description: ep.description && typeof ep.description === "string" ? ep.description : "API endpoint"
      }))
    : [];

  parsed.folderStructure = Array.isArray(parsed.folderStructure) && parsed.folderStructure.length >= 5
    ? parsed.folderStructure.filter(f => typeof f === "string" && f.trim()).slice(0, 30)
    : [];

  // System-design-specific fields
  parsed.scalingStrategy = Array.isArray(parsed.scalingStrategy) && parsed.scalingStrategy.length >= 3
    ? parsed.scalingStrategy.filter(s => typeof s === "string" && s.trim()).slice(0, 12)
    : [`Horizontal scaling of ${productName} services`, "Database read replicas", "CDN for static assets", "Caching layer with Redis"];

  parsed.securityConsiderations = Array.isArray(parsed.securityConsiderations) && parsed.securityConsiderations.length >= 3
    ? parsed.securityConsiderations.filter(s => typeof s === "string" && s.trim()).slice(0, 12)
    : ["OAuth 2.0 / JWT authentication", "TLS encryption in transit", "Data encryption at rest", "Rate limiting and DDoS protection"];

  parsed.infrastructure = Array.isArray(parsed.infrastructure) && parsed.infrastructure.length >= 3
    ? parsed.infrastructure.filter(s => typeof s === "string" && s.trim()).slice(0, 12)
    : ["AWS / GCP / Azure cloud infrastructure", "Kubernetes orchestration", "Docker containerization", "CI/CD pipeline"];

  parsed.industryPractices = Array.isArray(parsed.industryPractices) && parsed.industryPractices.length >= 3
    ? parsed.industryPractices.filter(s => typeof s === "string" && s.trim()).slice(0, 12)
    : ["Site reliability engineering (SRE)", "Continuous integration / delivery", "Chaos engineering", "Observability and monitoring"];

  parsed.deploymentStrategy = parsed.deploymentStrategy && typeof parsed.deploymentStrategy === "string" && parsed.deploymentStrategy.trim()
    ? parsed.deploymentStrategy.trim()
    : `${productName} uses blue-green deployments with automated canary releases and rollback capabilities.`;

  parsed.dataFlow = parsed.dataFlow && typeof parsed.dataFlow === "string" && parsed.dataFlow.trim()
    ? parsed.dataFlow.trim()
    : `Client → CDN → Load Balancer → API Gateway → ${productName} Services → Database / Cache`;

  // Explicitly clear resume/career fields so they are never stored for reverse-engineered products
  parsed.resumePoints = [];
  parsed.resumeBullets = [];
  parsed.alternatives = [];
  parsed.roadmap = [];

  const techAdvisor = parsed.techAdvisor && typeof parsed.techAdvisor === "object" ? parsed.techAdvisor : {};
  parsed.techAdvisor = {
    recommendedFrontend: Array.isArray(techAdvisor.recommendedFrontend) && techAdvisor.recommendedFrontend.length > 0
      ? techAdvisor.recommendedFrontend.filter(t => typeof t === "string").slice(0, 8)
      : [],
    recommendedBackend: Array.isArray(techAdvisor.recommendedBackend) && techAdvisor.recommendedBackend.length > 0
      ? techAdvisor.recommendedBackend.filter(t => typeof t === "string").slice(0, 8)
      : [],
    recommendedDatabase: Array.isArray(techAdvisor.recommendedDatabase) && techAdvisor.recommendedDatabase.length > 0
      ? techAdvisor.recommendedDatabase.filter(t => typeof t === "string").slice(0, 8)
      : [],
    deploymentSuggestions: Array.isArray(techAdvisor.deploymentSuggestions) && techAdvisor.deploymentSuggestions.length > 0
      ? techAdvisor.deploymentSuggestions.filter(t => typeof t === "string").slice(0, 8)
      : []
  };

  // Architecture diagram
  const defaultNodes = [
    { id: "client", label: "Client Layer\n(Web / Mobile)" },
    { id: "cdn", label: "CDN\n(CloudFront / Fastly)" },
    { id: "loadbalancer", label: "Load Balancer" },
    { id: "api", label: "API Gateway" },
    { id: "services", label: `${productName}\nServices` },
    { id: "database", label: "Database Layer" },
    { id: "cache", label: "Cache\n(Redis)" },
    { id: "queue", label: "Message Queue\n(Kafka)" }
  ];
  const defaultEdges = [
    { source: "client", target: "cdn" },
    { source: "cdn", target: "loadbalancer" },
    { source: "loadbalancer", target: "api" },
    { source: "api", target: "services" },
    { source: "services", target: "database" },
    { source: "services", target: "cache" },
    { source: "services", target: "queue" }
  ];

  parsed.architectureNodes = Array.isArray(parsed.architectureNodes) && parsed.architectureNodes.length >= 3
    ? parsed.architectureNodes
        .filter(n => n && typeof n.id === "string" && typeof n.label === "string")
        .slice(0, 12)
    : defaultNodes;

  parsed.architectureEdges = Array.isArray(parsed.architectureEdges) && parsed.architectureEdges.length >= 2
    ? parsed.architectureEdges
        .filter(e => e && typeof e.source === "string" && typeof e.target === "string")
        .slice(0, 20)
    : defaultEdges;

  console.log("\n=== REVERSE ENGINEERED PRODUCT (system-design only) ===");
  console.log("Product:", parsed.title);
  console.log("Tech Stack:", parsed.techStack?.slice(0, 5).join(", "));
  console.log("Scaling Strategies:", parsed.scalingStrategy?.length);
  console.log("=== END REVERSE ENGINEER ===\n");

  return parsed;
}
