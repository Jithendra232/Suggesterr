import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function callGemini(prompt, maxAttempts = 2) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response?.text();
      if (!text) throw new Error("Empty Gemini response");
      // Strip markdown code fences if present (safety net)
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
  const prompt = `You are an expert technical interviewer. Generate interview questions WITH DETAILED ANSWERS for this project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}
Difficulty: ${project.difficulty}

Generate questions in these exact 4 categories with 5 questions each. Every question MUST have a detailed answer (3-5 sentences). Return valid JSON:
[
  {
    "category": "HR Questions",
    "questions": [{"question": "...", "answer": "Detailed 3-5 sentence answer..."}]
  },
  {
    "category": "Technical Questions",
    "questions": [{"question": "...", "answer": "Detailed technical answer with code concepts..."}]
  },
  {
    "category": "Follow-up Questions",
    "questions": [{"question": "...", "answer": "Detailed follow-up answer..."}]
  },
  {
    "category": "Project Defense Questions",
    "questions": [{"question": "...", "answer": "Detailed defense answer explaining design choices..."}]
  }
]

IMPORTANT: Every answer must be substantive, specific to THIS project, and at least 3 sentences long. Include specific technology references from the tech stack.`;

  try {
    const result = await callGemini(prompt);
    if (Array.isArray(result) && result.length > 0) {
      // Post-validate: ensure every question has a non-empty answer
      const validated = result.map((cat) => ({
        ...cat,
        questions: (cat.questions || []).map((q) => ({
          question: q.question || "",
          answer: (q.answer && typeof q.answer === "string" && q.answer.trim().length > 10)
            ? q.answer.trim()
            : `This question relates to the ${project.title} project. A strong answer should reference ${project.techStack?.slice(0, 2).join(" and ") || "the project's tech stack"} and explain the design decisions made during development.`
        }))
      }));
      return validated;
    }
  } catch (err) {
    console.error("Interview questions generation failed:", err.message);
  }

  // Fallback with actual answers
  return [
    { category: "HR Questions", questions: [
      { question: "Tell me about this project and your role in it.", answer: `I built ${project.title}, a ${project.domain} application using ${project.techStack?.slice(0,3).join(", ")}. I was responsible for the full-stack development including architecture design, database modeling, API development, and frontend implementation. The project demonstrates my ability to deliver a complete software solution from concept to deployment.` },
      { question: "What challenges did you face during development?", answer: `One major challenge was designing the database schema to handle complex relationships efficiently. I also had to implement proper error handling across the entire stack and ensure the API responses were consistent. Performance optimization was another key challenge, especially when dealing with large datasets.` },
      { question: "How did you manage time and priorities?", answer: `I followed an agile approach, breaking the project into milestones and prioritizing core features first. I used the development roadmap to stay on track and made trade-off decisions when needed. Regular self-reviews helped me maintain code quality while meeting deadlines.` },
      { question: "What would you do differently next time?", answer: `I would invest more time in writing comprehensive tests from the beginning rather than adding them later. I would also set up CI/CD earlier in the development process and implement more robust logging from day one. Additionally, I would consider microservices architecture if the project scope warranted it.` },
      { question: "How does this project demonstrate your skills?", answer: `This project showcases full-stack development proficiency with ${project.techStack?.slice(0,3).join(", ")}. It demonstrates my understanding of RESTful API design, database normalization, authentication patterns, and responsive UI development. The complexity score of ${project.complexityScore}/100 reflects the technical depth involved.` }
    ]},
    { category: "Technical Questions", questions: [
      { question: `Explain the architecture of ${project.title}.`, answer: `${project.title} follows a ${project.architecture || 'layered MVC'} architecture pattern. The frontend handles user interaction and state management, communicating with the backend via RESTful APIs. The backend processes business logic and manages database operations, ensuring separation of concerns throughout the application.` },
      { question: `Why did you choose ${project.techStack?.[0] || "this tech stack"}?`, answer: `I chose ${project.techStack?.[0] || "this technology"} because it offers excellent performance, a mature ecosystem, and strong community support. It aligns well with the project's ${project.domain} domain requirements and scales effectively. The learning curve was manageable and it integrates well with the other technologies in the stack.` },
      { question: "How do you handle error cases?", answer: `I implemented a centralized error handling middleware that catches both operational and programming errors. Custom error classes differentiate between client errors (400s) and server errors (500s). All errors are logged for debugging, and user-friendly messages are returned to the frontend without exposing sensitive implementation details.` },
      { question: "Describe your authentication approach.", answer: `I implemented token-based authentication using industry-standard practices. Passwords are hashed before storage, tokens have expiration times, and protected routes verify authentication on every request. I also implemented role-based access control to restrict features based on user permissions.` },
      { question: "How would you scale this application?", answer: `For horizontal scaling, I would add a load balancer and run multiple backend instances. Database scaling could involve read replicas and sharding for write-heavy operations. I would also implement caching with Redis for frequently accessed data and consider CDN for static asset delivery.` }
    ]},
    { category: "Follow-up Questions", questions: [
      { question: "What testing strategy did you use?", answer: `I employed a multi-layered testing approach: unit tests for individual functions and utilities, integration tests for API endpoints and database operations, and end-to-end tests for critical user flows. I focused on testing business logic thoroughly and used mocking for external dependencies.` },
      { question: "How do you handle database migrations?", answer: `I use a migration-based approach where schema changes are versioned and applied sequentially. Each migration is reversible with up and down operations. I test migrations on a staging environment before applying to production to prevent data loss.` },
      { question: "What security measures are in place?", answer: `The application implements input validation on both client and server, CORS restrictions, rate limiting on API endpoints, and proper authentication/authorization checks. Sensitive data is encrypted at rest and in transit, and I follow the principle of least privilege for database access.` },
      { question: "How do you manage environment configuration?", answer: `I use environment variables for all configuration that varies between environments. A centralized config module loads and validates these variables at startup. Separate .env files exist for development, testing, and production, with sensitive values never committed to version control.` },
      { question: "What monitoring and logging do you have?", answer: `The application includes structured logging with different severity levels for debugging, warnings, and errors. Request logging tracks API usage patterns and response times. In production, I would integrate with monitoring services for real-time alerts on errors and performance degradation.` }
    ]},
    { category: "Project Defense Questions", questions: [
      { question: "Why did you choose this architectural pattern?", answer: `The chosen architecture pattern provides clear separation of concerns, making the codebase maintainable and testable. Each layer has a specific responsibility: presentation, business logic, and data access. This pattern is well-established in the industry and makes onboarding new developers easier.` },
      { question: "How are concerns separated in your codebase?", answer: `The codebase follows a layered architecture where controllers handle HTTP concerns, services contain business logic, and models manage data access. Middleware handles cross-cutting concerns like authentication and logging. This separation ensures each module has a single responsibility and can be tested independently.` },
      { question: "Describe your API design philosophy.", answer: `I follow RESTful conventions with consistent naming, proper HTTP method usage, and meaningful status codes. Endpoints are versioned for backward compatibility, and responses follow a standard envelope format. I also implement pagination for list endpoints and proper error response schemas.` },
      { question: "How do you handle cross-cutting concerns?", answer: `Cross-cutting concerns like authentication, logging, error handling, and CORS are implemented as middleware that wraps route handlers. This keeps individual route handlers clean and focused on their primary responsibility while ensuring consistent behavior across all endpoints.` },
      { question: "What design patterns did you use?", answer: `I used several design patterns: Factory pattern for creating database connections, Repository pattern for data access abstraction, Middleware pattern for request processing pipeline, and Observer pattern for event-driven features. These patterns improve code reusability and maintainability.` }
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

// ─── Feature: Project Description ─────────────────────────────────────────────

export async function generateProjectDescriptionAI(project) {
  const prompt = `You are a professional project description writer. Generate three versions of a project description for:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}
Domain: ${project.domain}

Return valid JSON:
{
  "professional": "A polished 4-5 sentence project summary suitable for a portfolio or LinkedIn",
  "beginner": "A beginner-friendly 4-5 sentence explanation that someone with no coding experience can understand",
  "recruiter": "A recruiter-friendly 4-5 sentence description that highlights impact, technologies, and career value"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Project description generation failed:", err.message);
  }

  return {
    professional: `${project.title} is a ${project.difficulty.toLowerCase()}-level ${project.domain} application built with ${project.techStack?.slice(0, 3).join(", ")}. The project features ${project.features?.length || 6} core functionalities including ${project.features?.slice(0, 3).join(", ") || "authentication, CRUD operations, and a responsive UI"}. Designed with scalability and maintainability in mind, it follows modern software architecture principles and industry best practices.`,
    beginner: `${project.title} is a software project that helps users with ${project.domain.toLowerCase()} tasks. It is built using ${project.techStack?.slice(0, 2).join(" and ")} technologies that are popular and beginner-friendly. The project lets users perform key actions like ${project.features?.slice(0, 2).join(" and ") || "managing data and viewing results"}. Think of it as a web app you can use in your browser to accomplish specific tasks easily.`,
    recruiter: `${project.title} showcases full-stack development skills using ${project.techStack?.slice(0, 3).join(", ")} in the ${project.domain} space. The project demonstrates proficiency in ${project.difficulty.toLowerCase()}-level software engineering including API design, database modeling, and frontend development. With ${project.features?.length || 6} production-ready features, it reflects the candidate's ability to deliver complete, scalable solutions.`
  };
}

// ─── Feature: Common Mistakes ─────────────────────────────────────────────────

export async function generateCommonMistakesAI(project) {
  const prompt = `You are a senior software engineer. Generate project-specific common mistakes to avoid:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}
Difficulty: ${project.difficulty}

Return valid JSON:
{
  "design": ["design mistake 1", "design mistake 2", "design mistake 3"],
  "database": ["database mistake 1", "database mistake 2", "database mistake 3"],
  "authentication": ["auth mistake 1", "auth mistake 2", "auth mistake 3"],
  "deployment": ["deployment mistake 1", "deployment mistake 2", "deployment mistake 3"],
  "resume": ["resume mistake 1", "resume mistake 2", "resume mistake 3"]
}

Each mistake should be specific to THIS project type and tech stack.`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Common mistakes generation failed:", err.message);
  }

  return {
    design: [
      `Not implementing proper component separation for ${project.techStack?.[0] || "the frontend"}`,
      `Skipping responsive design considerations for ${project.title}'s user interface`,
      `Not establishing a consistent state management pattern early in development`
    ],
    database: [
      `Failing to add proper indexes for frequently queried fields`,
      `Not normalizing data properly leading to redundant storage and update anomalies`,
      `Missing database migration strategy making schema changes risky in production`
    ],
    authentication: [
      `Storing sensitive tokens in localStorage instead of httpOnly cookies`,
      `Not implementing proper password complexity requirements and hashing`,
      `Missing rate limiting on authentication endpoints`
    ],
    deployment: [
      `Not setting up environment-specific configuration for dev/staging/production`,
      `Skipping health check endpoints making monitoring and auto-scaling difficult`,
      `Not implementing proper logging making production debugging nearly impossible`
    ],
    resume: [
      `Describing responsibilities instead of measurable achievements and impact`,
      `Not quantifying results with specific metrics`,
      `Listing technologies without explaining how they were applied in the project`
    ]
  };
}

// ─── Feature: Scalability Suggestions ─────────────────────────────────────────

export async function generateScalabilitySuggestionsAI(project) {
  const prompt = `You are a senior systems architect. Generate scalability suggestions for:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}

Return valid JSON:
{
  "currentLimitations": ["limitation 1", "limitation 2", "limitation 3"],
  "scalingChallenges": ["challenge 1", "challenge 2", "challenge 3"],
  "futureImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "largeUserStrategies": ["strategy 1", "strategy 2", "strategy 3"]
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Scalability suggestions generation failed:", err.message);
  }

  return {
    currentLimitations: [
      `Single-server architecture limits horizontal scaling for ${project.title}`,
      `Synchronous request handling creates bottlenecks under high concurrent load`,
      `No caching layer means repeated database queries for the same data`
    ],
    scalingChallenges: [
      `Database connection pooling needs tuning for 1000+ concurrent connections`,
      `Session management becomes complex when scaling to multiple server instances`,
      `File storage strategy needs rethinking for distributed deployment scenarios`
    ],
    futureImprovements: [
      `Implement Redis caching to reduce database load by up to 60%`,
      `Add message queue (RabbitMQ/Kafka) for async background job processing`,
      `Migrate to microservices architecture for independent service scaling`
    ],
    largeUserStrategies: [
      `Implement CDN for static assets and database read replicas`,
      `Add load balancing with sticky sessions for consistent user experience`,
      `Use database sharding to distribute data across multiple instances`
    ]
  };
}

// ─── Feature: Industry-Level Improvements ─────────────────────────────────────

export async function generateIndustryImprovementsAI(project) {
  const prompt = `You are an enterprise software architect. Generate industry-level improvements for:

Title: ${project.title}
Tech Stack: ${project.techStack?.join(", ")}
Domain: ${project.domain}

Return valid JSON:
{
  "enterpriseFeatures": ["feature 1", "feature 2", "feature 3"],
  "securityImprovements": ["security 1", "security 2", "security 3"],
  "monitoringLogging": ["monitoring 1", "monitoring 2", "monitoring 3"],
  "cicdRecommendations": ["cicd 1", "cicd 2", "cicd 3"],
  "productionEnhancements": ["enhancement 1", "enhancement 2", "enhancement 3"]
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Industry improvements generation failed:", err.message);
  }

  return {
    enterpriseFeatures: [
      `Implement multi-tenancy to serve multiple organizations with data isolation`,
      `Add SSO integration with SAML/OAuth2 for enterprise identity management`,
      `Build admin dashboard with role-based permissions and audit logging`
    ],
    securityImprovements: [
      `Implement OWASP Top 10 protections including XSS, CSRF, and SQL injection prevention`,
      `Add API rate limiting and request throttling with Redis-backed token buckets`,
      `Implement secrets management using HashiCorp Vault or AWS Secrets Manager`
    ],
    monitoringLogging: [
      `Integrate structured logging with ELK stack for centralized log analysis`,
      `Add APM tools (Datadog/New Relic) for real-time performance monitoring`,
      `Implement distributed tracing for debugging requests across services`
    ],
    cicdRecommendations: [
      `Set up GitHub Actions workflow with automated testing, linting, and deployment`,
      `Add container scanning and dependency vulnerability checks in CI pipeline`,
      `Implement blue-green deployment strategy for zero-downtime releases`
    ],
    productionEnhancements: [
      `Add health check endpoints and readiness probes for Kubernetes orchestration`,
      `Implement feature flags for safe feature rollout and A/B testing`,
      `Add database connection pooling and query optimization for production workloads`
    ]
  };
}

// ─── Feature: README Generator ────────────────────────────────────────────────

export async function generateReadmeAI(project) {
  const prompt = `You are a README documentation expert. Generate a complete, professional README.md for:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}

Return ONLY the README content as a plain string (no JSON wrapping). Use proper markdown formatting with ## headers, bullet points, and code blocks. Include:
# Title, ## Overview, ## Features, ## Tech Stack, ## Installation, ## Usage, ## API Overview, ## Project Structure, ## Deployment, ## Future Improvements, ## License`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response?.text();
    if (text && typeof text === "string" && text.length > 100) {
      return text.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim();
    }
  } catch (err) {
    console.error("README generation failed:", err.message);
  }

  const slug = project.title.toLowerCase().replace(/\s+/g, "-");
  return `# ${project.title}\n\n${project.description}\n\n## Overview\n\nA ${project.difficulty.toLowerCase()}-level ${project.domain} application demonstrating modern full-stack development practices.\n\n## Features\n\n${project.features?.map(f => `- ${f}`).join("\n") || "- Core application features"}\n\n## Tech Stack\n\n${project.techStack?.map(t => `- ${t}`).join("\n") || "- See package.json"}\n\n## Installation\n\n\`\`\`bash\ngit clone <repo>\ncd ${slug}\nnpm install\nnpm start\n\`\`\`\n\n## Usage\n\nNavigate to the URL shown in the terminal after starting the app.\n\n## API Overview\n\n${project.apiEndpoints?.map(e => `- **${e.method}** \`${e.endpoint}\` - ${e.description}`).join("\n") || "See API documentation."}\n\n## Project Structure\n\n\`\`\`\n${project.folderStructure?.slice(0, 10).join("\n") || "src/\npublic/\npackage.json"}\n\`\`\`\n\n## Deployment\n\nDeploy to any cloud platform.\n\n## Future Improvements\n\n${project.improvements?.map(i => `- ${i}`).join("\n") || "- Performance optimizations\n- Additional features"}\n\n## License\n\nMIT License`;
}

// ─── Feature: Resume Project Description ──────────────────────────────────────

export async function generateResumeDescriptionAI(project) {
  const prompt = `You are a resume writing expert. Generate resume-ready project descriptions for:

Title: ${project.title}
Tech Stack: ${project.techStack?.join(", ")}
Features: ${project.features?.join(", ")}
Domain: ${project.domain}

Return valid JSON:
{
  "fiftyWords": "Exactly 50 words describing the project for a resume",
  "hundredWords": "Exactly 100 words with detail including specific technologies and impact",
  "atsFriendly": "ATS-friendly description with keywords from tech stack and action verbs",
  "oneLine": "A single powerful line (max 20 words) for a resume bullet point"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Resume description generation failed:", err.message);
  }

  const techList = project.techStack?.slice(0, 4).join(", ") || "modern technologies";
  return {
    fiftyWords: `Built ${project.title}, a ${project.difficulty.toLowerCase()}-level ${project.domain} application using ${techList}. Implemented ${project.features?.length || 6} core features with scalable architecture, RESTful APIs, and optimized database queries achieving efficient data processing.`,
    hundredWords: `Developed ${project.title}, a comprehensive ${project.domain} platform using ${techList}. Engineered ${project.features?.length || 6} production-ready features spanning user management, data operations, and real-time functionality. Architected a scalable solution with RESTful APIs, optimized database schema, and ${project.apiEndpoints?.length || 8} endpoints. Implemented industry-standard security practices. Demonstrates full-stack competency.`,
    atsFriendly: `Developed and deployed ${project.title} using ${techList}, implementing ${project.features?.length || 6} features with RESTful APIs, database optimization, and authentication. Achieved scalable architecture with industry-standard security practices.`,
    oneLine: `Built ${project.title} — a ${project.domain} platform using ${techList} with ${project.features?.length || 6} features.`
  };
}

// ─── Feature: Architecture Explanation ─────────────────────────────────────────

export async function generateArchitectureExplanationAI(project) {
  const prompt = `You are a software architecture educator. Explain the architecture of this project:

Title: ${project.title}
Tech Stack: ${project.techStack?.join(", ")}
Architecture: ${project.architecture || "MVC"}
Database: ${project.databaseSchema?.map(s => s.collection).join(", ")}

Return valid JSON:
{
  "frontend": "3-5 sentences explaining frontend architecture, components, state management, routing",
  "backend": "3-5 sentences explaining backend architecture, API design, middleware, request handling",
  "database": "3-5 sentences explaining database design, schema, relationships, indexing",
  "authentication": "3-5 sentences explaining auth flow, tokens, security",
  "dataFlow": "3-5 sentences explaining data flow from user action through the full stack"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && typeof result === "object") return result;
  } catch (err) {
    console.error("Architecture explanation generation failed:", err.message);
  }

  return {
    frontend: `The frontend of ${project.title} is built with ${project.techStack?.[0] || "a modern framework"}, following a component-based architecture. Components are organized hierarchically with clear separation between presentational and container components. State management is handled through local component state and context providers for shared data.`,
    backend: `The backend follows a ${project.architecture || "layered MVC"} architecture using ${project.techStack?.[1] || "the backend framework"}. Controllers handle HTTP requests, services encapsulate business logic, and models manage data access. Middleware processes cross-cutting concerns like authentication and error handling.`,
    database: `The database layer uses ${project.databaseSchema?.[0]?.collection ? project.databaseSchema.map(s => s.collection).join(", ") : "a well-designed schema"}. The schema is normalized to reduce redundancy while maintaining query efficiency. Indexes optimize read performance on frequently queried fields.`,
    authentication: `Authentication uses token-based mechanisms where users receive a secure token upon login. Tokens are included in subsequent requests to verify identity. Authorization is enforced at the route level through middleware checking user permissions.`,
    dataFlow: `User interactions trigger API calls through the HTTP client. The request travels to backend middleware for authentication validation. The controller delegates to services for business logic, which interact with the database model, then return results back through the response chain to update the UI.`
  };
}

// ─── Feature: AI Mentor Chat ─────────────────────────────────────────────────

export async function chatWithProject(project, userMessage) {
  const context = buildProjectContext(project);

  const prompt = `You are an AI Mentor / Senior Software Architect assistant for a VisualCS project.
Use the project context below to answer the user's question accurately and helpfully.

RULES:
- Base your answers on the actual project data provided.
- Be specific — reference actual technologies, features, and architecture from the project.
- Keep answers clear, concise, and practical (2-6 paragraphs unless the question requires more detail).
- If the question is outside the project scope, say so and suggest how it could be adapted.
- Use markdown formatting for readability (headers, bullet points, code blocks where relevant).

## Project Context
${context}

## User Question
${userMessage}

Return valid JSON:
{
  "response": "Your detailed answer here with markdown formatting"
}`;

  try {
    const result = await callGemini(prompt);
    if (result && result.response && typeof result.response === "string") {
      return result.response;
    }
  } catch (err) {
    console.error("AI Mentor chat failed:", err.message);
  }

  return `I apologize, but I'm unable to process your question right now. Please try again in a moment.`;
}

function buildProjectContext(project) {
  const sections = [];

  sections.push(`**Title:** ${project.title || "N/A"}`);
  sections.push(`**Description:** ${project.description || "N/A"}`);
  sections.push(`**Domain:** ${project.domain || "N/A"}`);
  sections.push(`**Difficulty:** ${project.difficulty || "N/A"}`);
  sections.push(`**Estimated Time:** ${project.estimatedTime || "N/A"}`);

  if (project.features?.length) {
    sections.push(`\n**Features:**\n${project.features.map(f => `- ${f}`).join("\n")}`);
  }

  if (project.techStack?.length) {
    sections.push(`\n**Tech Stack:** ${project.techStack.join(", ")}`);
  }

  if (project.architecture) {
    sections.push(`\n**Architecture:** ${project.architecture}`);
  }

  if (project.databaseSchema?.length) {
    sections.push(`\n**Database Schema:**\n${project.databaseSchema.map(s =>
      `- **${s.collection}**: ${s.fields?.map(f => `${f.name} (${f.type})`).join(", ")}`
    ).join("\n")}`);
  }

  if (project.apiEndpoints?.length) {
    sections.push(`\n**API Endpoints:**\n${project.apiEndpoints.map(e =>
      `- ${e.method} ${e.endpoint}: ${e.description}`
    ).join("\n")}`);
  }

  if (project.complexityScore != null) {
    sections.push(`\n**Complexity Score:** ${project.complexityScore}/100`);
  }

  if (project.resumePoints?.length) {
    sections.push(`\n**Resume Points:**\n${project.resumePoints.slice(0, 5).map(r => `- ${r}`).join("\n")}`);
  }

  if (project.improvements?.length) {
    sections.push(`\n**Improvements:**\n${project.improvements.slice(0, 4).map(i => `- ${i}`).join("\n")}`);
  }

  if (project.documentation) {
    sections.push(`\n**Documentation:**\n${project.documentation.projectOverview || ""}\n${project.documentation.architectureDocumentation || ""}`.trim());
  }

  if (project.recruiterAnalysis) {
    const ra = project.recruiterAnalysis;
    sections.push(`\n**Recruiter Analysis:** Score ${ra.recruiterScore}/100, Strengths: ${ra.strengths?.join(", ") || "N/A"}, Weaknesses: ${ra.weaknesses?.join(", ") || "N/A"}`);
  }

  return sections.join("\n");
}
