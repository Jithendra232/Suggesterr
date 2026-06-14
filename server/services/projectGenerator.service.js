// ─── Stack Detection Helpers ───────────────────────────────────────────────

const STACK_PATTERNS = {
  java: {
    keywords: ["java", "spring", "spring boot", "hibernate", "maven", "gradle", "jpa"],
    frontend: ["Thymeleaf", "JSP", "Angular"],
    backend: ["Java", "Spring Boot", "Spring Security", "Hibernate", "Maven"],
    database: ["MySQL", "PostgreSQL", "H2"],
    tools: ["JUnit", "Swagger/OpenAPI", "Docker", "JWT Authentication"],
    dbType: "relational",
    ormName: "Hibernate/JPA",
    buildTool: "Maven",
    folderStyle: "java",
  },
  python: {
    keywords: ["python", "django", "flask", "fastapi", "celery", "pip"],
    frontend: ["Django Templates", "Jinja2", "HTMX"],
    backend: ["Python", "Django", "Django REST Framework", "Celery"],
    database: ["PostgreSQL", "SQLite", "Redis"],
    tools: ["Pytest", "Docker", "Redis", "JWT Authentication"],
    dbType: "relational",
    ormName: "Django ORM",
    buildTool: "pip/requirements.txt",
    folderStyle: "python",
  },
  dotnet: {
    keywords: ["c#", "csharp", ".net", "dotnet", "asp.net", "entity framework", "nuget"],
    frontend: ["Razor Pages", "Blazor", "Angular"],
    backend: ["C#", "ASP.NET Core", "Entity Framework Core", "LINQ"],
    database: ["SQL Server", "PostgreSQL", "SQLite"],
    tools: ["xUnit", "Docker", "AutoMapper", "JWT Authentication"],
    dbType: "relational",
    ormName: "Entity Framework Core",
    buildTool: "NuGet",
    folderStyle: "dotnet",
  },
  php: {
    keywords: ["php", "laravel", "symfony", "composer", "blade"],
    frontend: ["Blade Templates", "Vue.js", "Livewire"],
    backend: ["PHP", "Laravel", "Eloquent ORM", "Composer"],
    database: ["MySQL", "PostgreSQL", "SQLite"],
    tools: ["PHPUnit", "Docker", "Redis", "JWT Authentication"],
    dbType: "relational",
    ormName: "Eloquent ORM",
    buildTool: "Composer",
    folderStyle: "php",
  },
  go: {
    keywords: ["go", "golang", "gin", "fiber", "gorm", "echo"],
    frontend: ["Go Templates", "React", "HTMX"],
    backend: ["Go", "Gin", "GORM", "Fiber"],
    database: ["PostgreSQL", "MySQL", "Redis"],
    tools: ["Go Test", "Docker", "Swagger", "JWT Authentication"],
    dbType: "relational",
    ormName: "GORM",
    buildTool: "Go Modules",
    folderStyle: "go",
  },
  ruby: {
    keywords: ["ruby", "rails", "ruby on rails", "erb", "gem"],
    frontend: ["ERB Templates", "Hotwire", "Turbo"],
    backend: ["Ruby", "Ruby on Rails", "Active Record", "Sidekiq"],
    database: ["PostgreSQL", "SQLite", "Redis"],
    tools: ["RSpec", "Docker", "Redis", "Devise Authentication"],
    dbType: "relational",
    ormName: "Active Record",
    buildTool: "Bundler/Gems",
    folderStyle: "ruby",
  },
  rust: {
    keywords: ["rust", "actix", "rocket", "diesel", "cargo"],
    frontend: ["Askama Templates", "React", "HTMX"],
    backend: ["Rust", "Actix Web", "Diesel ORM", "Tokio"],
    database: ["PostgreSQL", "SQLite", "Redis"],
    tools: ["Cargo Test", "Docker", "Swagger", "JWT Authentication"],
    dbType: "relational",
    ormName: "Diesel",
    buildTool: "Cargo",
    folderStyle: "rust",
  },
  mern: {
    keywords: ["react", "node", "node.js", "express", "mongodb", "mongoose", "next", "nextjs", "next.js"],
    frontend: ["React 18 with Hooks", "Redux Toolkit", "React Router v6", "Tailwind CSS"],
    backend: ["Node.js", "Express.js", "Mongoose ODM", "JWT Authentication"],
    database: ["MongoDB", "Redis"],
    tools: ["Jest", "React Testing Library", "Docker", "Axios"],
    dbType: "document",
    ormName: "Mongoose",
    buildTool: "npm/yarn",
    folderStyle: "js",
  },
  mean: {
    keywords: ["angular", "node", "node.js", "express", "mongodb", "mongoose"],
    frontend: ["Angular", "RxJS", "Angular Material", "NgRx"],
    backend: ["Node.js", "Express.js", "Mongoose ODM", "JWT Authentication"],
    database: ["MongoDB", "Redis"],
    tools: ["Jasmine/Karma", "Docker", "Angular CLI", "Axios"],
    dbType: "document",
    ormName: "Mongoose",
    buildTool: "npm/yarn",
    folderStyle: "js",
  },
  flutter: {
    keywords: ["flutter", "dart", "firebase", "bloc", "provider"],
    frontend: ["Flutter", "Dart", "BLoC Pattern", "Material Design"],
    backend: ["Firebase", "Cloud Functions", "Firebase Auth"],
    database: ["Firestore", "SQLite", "Hive"],
    tools: ["Flutter Test", "Firebase CLI", "Docker", "Fastlane"],
    dbType: "document",
    ormName: "Firestore SDK",
    buildTool: "pub.dev",
    folderStyle: "flutter",
  },
  reactnative: {
    keywords: ["react native", "expo", "react-native"],
    frontend: ["React Native", "Expo", "React Navigation", "NativeBase"],
    backend: ["Node.js", "Express.js", "Firebase"],
    database: ["MongoDB", "SQLite", "AsyncStorage"],
    tools: ["Jest", "Detox", "Docker", "Expo CLI"],
    dbType: "document",
    ormName: "Mongoose",
    buildTool: "npm/yarn",
    folderStyle: "js",
  },
};

function detectStack(skills) {
  const lower = skills.map((s) => s.toLowerCase());
  let bestMatch = null;
  let bestScore = 0;

  for (const [stackName, pattern] of Object.entries(STACK_PATTERNS)) {
    const score = pattern.keywords.filter((kw) =>
      lower.some((s) => s.includes(kw) || kw.includes(s))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = stackName;
    }
  }

  return bestScore > 0 ? STACK_PATTERNS[bestMatch] : null;
}

function buildTechStack(skills, detectedStack) {
  const userSkills = [...skills];
  const stack = detectedStack || STACK_PATTERNS.mern;

  const combined = new Set([...userSkills]);
  stack.backend.forEach((t) => combined.add(t));
  stack.frontend.forEach((t) => combined.add(t));
  stack.database.forEach((t) => combined.add(t));
  stack.tools.forEach((t) => combined.add(t));
  combined.add("Docker");
  combined.add("REST API");

  return [...combined].slice(0, 12);
}

function buildArchitecture(domain, skills, detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;
  const backendName = stack.backend[0] || "Backend";
  const frontendName = stack.frontend[0] || "Frontend";
  const dbName = stack.database[0] || "Database";
  const ormName = stack.ormName || "ORM";

  return `${frontendName} frontend with ${backendName} REST API backend, ${dbName} database using ${ormName}, and ${stack.buildTool} for dependency management. ` +
    `Implements layered architecture with controller-service-repository pattern for ${domain} functionality. ` +
    `Includes JWT-based authentication, input validation middleware, and comprehensive error handling. ` +
    `Skills used: ${skills.join(", ")}.`;
}

function buildDatabaseSchema(detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;
  const isRelational = stack.dbType === "relational";
  const idType = isRelational ? "UUID/Serial" : "ObjectId";
  const fkType = isRelational ? "UUID/FK" : "ObjectId";
  const collectionLabel = isRelational ? "table" : "collection";

  return [
    {
      collection: "User",
      fields: [
        { name: "id", type: idType, description: "Unique user identifier" },
        { name: "name", type: "String", description: "User full name" },
        { name: "email", type: "String", description: "User email address (unique)" },
        { name: "password", type: "String", description: "Hashed password" },
        { name: "role", type: "String", description: "User role (admin, user)" },
        { name: "createdAt", type: "DateTime", description: "Account creation timestamp" },
      ],
    },
    {
      collection: "Project",
      fields: [
        { name: "id", type: idType, description: "Unique project identifier" },
        { name: "title", type: "String", description: "Project title" },
        { name: "description", type: "Text", description: "Detailed project description" },
        { name: "status", type: "String", description: "Project status (active, archived)" },
        { name: "userId", type: fkType, description: `Reference to User ${collectionLabel}` },
        { name: "createdAt", type: "DateTime", description: "Creation timestamp" },
        { name: "updatedAt", type: "DateTime", description: "Last update timestamp" },
      ],
    },
    {
      collection: "Activity",
      fields: [
        { name: "id", type: idType, description: "Unique activity identifier" },
        { name: "type", type: "String", description: "Activity type" },
        { name: "details", type: "Text", description: "Activity details" },
        { name: "projectId", type: fkType, description: `Reference to Project ${collectionLabel}` },
        { name: "userId", type: fkType, description: `Reference to User ${collectionLabel}` },
        { name: "createdAt", type: "DateTime", description: "Activity timestamp" },
      ],
    },
  ];
}

function buildApiEndpoints(detectedStack) {
  return [
    { method: "POST", endpoint: "/api/auth/register", description: "Register new user account" },
    { method: "POST", endpoint: "/api/auth/login", description: "User login and token generation" },
    { method: "POST", endpoint: "/api/auth/refresh", description: "Refresh authentication token" },
    { method: "GET", endpoint: "/api/projects", description: "List all projects (paginated)" },
    { method: "POST", endpoint: "/api/projects", description: "Create a new project" },
    { method: "GET", endpoint: "/api/projects/:id", description: "Get project details by ID" },
    { method: "PUT", endpoint: "/api/projects/:id", description: "Update project information" },
    { method: "DELETE", endpoint: "/api/projects/:id", description: "Delete a project" },
    { method: "GET", endpoint: "/api/dashboard/stats", description: "Get dashboard statistics" },
    { method: "GET", endpoint: "/api/users/profile", description: "Get current user profile" },
  ];
}

function buildFolderStructure(detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;

  switch (stack.folderStyle) {
    case "java":
      return [
        "src/main/java/com/project/controller",
        "src/main/java/com/project/service",
        "src/main/java/com/project/repository",
        "src/main/java/com/project/model/entity",
        "src/main/java/com/project/model/dto",
        "src/main/java/com/project/config",
        "src/main/java/com/project/security",
        "src/main/java/com/project/exception",
        "src/main/java/com/project/util",
        "src/main/resources/templates",
        "src/main/resources/static",
        "src/main/resources/application.yml",
        "src/test/java/com/project",
        "docker-compose.yml",
        "pom.xml",
      ];
    case "python":
      return [
        "project_name/settings",
        "project_name/urls.py",
        "apps/core/models",
        "apps/core/views",
        "apps/core/serializers",
        "apps/core/urls.py",
        "apps/core/tests",
        "apps/users/models",
        "apps/users/views",
        "templates/base",
        "static/css",
        "static/js",
        "requirements.txt",
        "manage.py",
        "docker-compose.yml",
      ];
    case "dotnet":
      return [
        "Controllers",
        "Models",
        "Data",
        "Services",
        "DTOs",
        "Middleware",
        "Extensions",
        "Interfaces",
        "Repositories",
        "Migrations",
        "appsettings.json",
        "Program.cs",
        "docker-compose.yml",
      ];
    case "php":
      return [
        "app/Http/Controllers",
        "app/Models",
        "app/Services",
        "app/Middleware",
        "database/migrations",
        "database/seeders",
        "resources/views",
        "routes/api.php",
        "routes/web.php",
        "config",
        "tests/Feature",
        "tests/Unit",
        "docker-compose.yml",
        "composer.json",
      ];
    case "go":
      return [
        "cmd/server",
        "internal/handler",
        "internal/service",
        "internal/repository",
        "internal/model",
        "internal/middleware",
        "internal/config",
        "pkg/utils",
        "migrations",
        "api",
        "go.mod",
        "go.sum",
        "docker-compose.yml",
        "Makefile",
      ];
    case "ruby":
      return [
        "app/controllers",
        "app/models",
        "app/views",
        "app/services",
        "app/mailers",
        "config/routes.rb",
        "db/migrate",
        "db/seeds.rb",
        "spec/models",
        "spec/controllers",
        "lib/tasks",
        "docker-compose.yml",
        "Gemfile",
      ];
    case "rust":
      return [
        "src/main.rs",
        "src/handlers",
        "src/models",
        "src/services",
        "src/middleware",
        "src/config",
        "src/routes",
        "src/errors",
        "migrations",
        "tests",
        "Cargo.toml",
        "docker-compose.yml",
      ];
    case "flutter":
      return [
        "lib/main.dart",
        "lib/screens",
        "lib/widgets",
        "lib/models",
        "lib/services",
        "lib/providers",
        "lib/utils",
        "lib/config",
        "assets/images",
        "assets/fonts",
        "test",
        "pubspec.yaml",
      ];
    case "js":
    default:
      return [
        "client/src/components",
        "client/src/pages",
        "client/src/services",
        "client/src/hooks",
        "client/src/context",
        "client/src/utils",
        "client/src/layouts",
        "client/src/routes",
        "client/src/config",
        "server/src/controllers",
        "server/src/models",
        "server/src/routes",
        "server/src/middleware",
        "server/src/services",
        "server/src/config",
        "docker-compose.yml",
      ];
  }
}

function buildResumePoints(skills, domain, difficulty, detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;
  const backendName = stack.backend[0] || "Backend";
  const frontendName = stack.frontend[0] || "Frontend";
  const dbName = stack.database[0] || "Database";
  const skillText = skills.slice(0, 3).join(", ");

  return [
    `Developed a full-stack ${domain} application using ${skillText} with modern architectural patterns`,
    `Implemented secure JWT-based authentication and role-based authorization system`,
    `Designed and built RESTful APIs with ${backendName} following industry best practices`,
    `Integrated ${dbName} with ${stack.ormName} for efficient data persistence and querying`,
    `Built responsive and accessible user interfaces with ${frontendName}`,
    `Implemented comprehensive error handling and input validation across all layers`,
    `Deployed production-ready application with Docker containerization and CI/CD pipeline`,
    `Followed ${stack.buildTool}-based dependency management and clean code architecture`,
  ];
}

function buildResumeBullets(skills, domain, difficulty, detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;
  const backendName = stack.backend[0] || "Backend";
  const frontendName = stack.frontend[0] || "Frontend";
  const dbName = stack.database[0] || "Database";
  const skillText = skills.slice(0, 3).join(", ");

  return [
    `Architected and developed a ${difficulty.toLowerCase()}-level ${domain} application using ${skillText} serving 500+ active users with 99.9% uptime`,
    `Implemented JWT-based authentication system reducing unauthorized access attempts by 95%`,
    `Designed RESTful API with 15+ endpoints handling 10,000+ daily requests with average response time under 200ms`,
    `Optimized ${dbName} queries resulting in 40% improvement in database performance`,
    `Built responsive ${frontendName} frontend achieving 95+ Google Lighthouse performance score`,
    `Integrated real-time features improving user engagement by 60%`,
    `Deployed application to production using CI/CD pipeline reducing deployment time by 70%`,
    `Collaborated with cross-functional team of 4 developers following Agile methodology`,
  ];
}

function buildTechAdvisor(skills, detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;

  return {
    recommendedFrontend: stack.frontend.slice(0, 5),
    recommendedBackend: stack.backend.slice(0, 5),
    recommendedDatabase: [...stack.database, "Redis for caching"].slice(0, 4),
    deploymentSuggestions: ["Docker for containerization", "GitHub Actions for CI/CD", "AWS/Render for hosting", "Monitoring with logging tools"],
  };
}

// ─── Templates (project ideas only, no hardcoded stack) ─────────────────────

const templates = {
  "AI/ML": [
    {
      title: "AI Resume Analyzer",
      description: "A resume analysis platform that scores resumes against job descriptions and recommends targeted improvements.",
      features: ["Resume upload workflow", "Keyword match scoring", "Skill gap insights", "Improvement checklist"],
      estimatedTime: "3-5 weeks"
    },
    {
      title: "AI Interview Coach",
      description: "A practice tool that asks role-specific interview questions and helps students review their answers.",
      features: ["Question bank", "Answer history", "Performance dashboard", "Topic-wise practice sessions"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Smart Study Assistant",
      description: "A study planner that organizes topics, quizzes learners, and tracks progress across subjects.",
      features: ["Study plan builder", "Quiz generation templates", "Progress tracking", "Revision reminders"],
      estimatedTime: "3-4 weeks"
    }
  ],
  "Web Development": [
    {
      title: "E-Commerce Platform",
      description: "A full-stack store with product management, cart workflows, checkout preparation, and order dashboards.",
      features: ["Product catalog", "Cart management", "Order history", "Admin product controls"],
      estimatedTime: "5-7 weeks"
    },
    {
      title: "Task Management App",
      description: "A collaborative productivity app for organizing projects, deadlines, and team task ownership.",
      features: ["Project boards", "Task assignments", "Due date tracking", "Team comments"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "CRM Dashboard",
      description: "A customer relationship dashboard for tracking leads, follow-ups, and sales activity.",
      features: ["Lead pipeline", "Contact records", "Follow-up reminders", "Revenue analytics"],
      estimatedTime: "4-6 weeks"
    }
  ],
  "Mobile Development": [
    {
      title: "Campus Companion App",
      description: "A mobile-first student utility for schedules, announcements, resources, and reminders.",
      features: ["Class timetable", "Announcement feed", "Resource library", "Push notification ready API"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Habit Tracker",
      description: "A habit-building app with streaks, reminders, progress charts, and weekly reflections.",
      features: ["Habit creation", "Daily check-ins", "Streak analytics", "Reminder settings"],
      estimatedTime: "3-5 weeks"
    },
    {
      title: "Local Services Finder",
      description: "A location-aware app that helps users discover and review nearby essential services.",
      features: ["Service listings", "Search filters", "Reviews", "Saved places"],
      estimatedTime: "5-7 weeks"
    }
  ],
  "Cyber Security": [
    {
      title: "Phishing Awareness Trainer",
      description: "A training platform that teaches users how to identify phishing emails through guided simulations.",
      features: ["Email scenario library", "Risk scoring", "Learning modules", "Attempt history"],
      estimatedTime: "3-5 weeks"
    },
    {
      title: "Password Health Dashboard",
      description: "A security dashboard that evaluates password habits and provides practical improvement guidance.",
      features: ["Strength checker", "Breach-safe architecture notes", "User scorecards", "Security tips"],
      estimatedTime: "2-4 weeks"
    },
    {
      title: "Security Incident Tracker",
      description: "A ticketing system for documenting incidents, severity, response steps, and resolution timelines.",
      features: ["Incident reports", "Severity labels", "Response checklist", "Audit timeline"],
      estimatedTime: "4-6 weeks"
    }
  ],
  "Data Science": [
    {
      title: "Student Performance Analytics",
      description: "A dashboard that visualizes academic performance trends and identifies improvement areas.",
      features: ["CSV import", "Trend charts", "Subject insights", "Recommendation notes"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Sales Forecast Dashboard",
      description: "A business analytics tool for exploring historical sales and generating forecast-ready reports.",
      features: ["Data upload", "KPI cards", "Forecast preview", "Exportable reports"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Survey Insights Platform",
      description: "A platform for collecting survey responses and summarizing sentiment, trends, and segments.",
      features: ["Survey builder", "Response analytics", "Sentiment categories", "Segment filters"],
      estimatedTime: "3-5 weeks"
    }
  ],
  DevOps: [
    {
      title: "Deployment Health Monitor",
      description: "A dashboard that tracks deployment status, service uptime, and incident notes for small teams.",
      features: ["Service registry", "Health checks", "Deployment timeline", "Incident annotations"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "CI/CD Pipeline Visualizer",
      description: "A tool that displays build stages, test results, and deployment outcomes across projects.",
      features: ["Pipeline cards", "Build history", "Failure summaries", "Team notifications"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Infrastructure Cost Tracker",
      description: "A cost tracking dashboard for comparing cloud resources, budgets, and monthly usage trends.",
      features: ["Resource inventory", "Budget alerts", "Monthly charts", "Cost categories"],
      estimatedTime: "5-7 weeks"
    }
  ],
  "Cloud Computing": [
    {
      title: "Cloud Resource Manager",
      description: "A dashboard for organizing cloud projects, resource metadata, ownership, and lifecycle status.",
      features: ["Resource catalog", "Owner assignment", "Lifecycle states", "Usage summaries"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Serverless Workflow Tracker",
      description: "A workflow tracker for modeling serverless functions, triggers, logs, and execution status.",
      features: ["Function registry", "Trigger mapping", "Execution logs", "Failure alerts"],
      estimatedTime: "4-6 weeks"
    },
    {
      title: "Multi-Cloud Learning Lab",
      description: "A guided learning platform that tracks cloud labs, completion status, and concept mastery.",
      features: ["Lab catalog", "Progress tracking", "Concept quizzes", "Completion certificates"],
      estimatedTime: "3-5 weeks"
    }
  ]
};

const difficultyEnhancements = {
  Beginner: {
    feature: "Guided setup checklist",
    tech: "Clean REST API",
    timeNote: " with beginner-friendly scope"
  },
  Intermediate: {
    feature: "Analytics dashboard",
    tech: "Reusable service architecture",
    timeNote: " with polished dashboard workflows"
  },
  Advanced: {
    feature: "Role-based access and audit logs",
    tech: "Production deployment pipeline",
    timeNote: " with advanced production concerns"
  }
};

export const validDomains = Object.keys(templates);
export const validDifficulties = Object.keys(difficultyEnhancements);

export function generateProject({ skills, domain, difficulty }) {
  const options = templates[domain];
  const skillText = skills.join("|").toLowerCase();
  const seed = [...skillText].reduce((sum, char) => sum + char.charCodeAt(0), 0) + difficulty.length;
  const base = options[seed % options.length];
  const enhancement = difficultyEnhancements[difficulty];

  const detectedStack = detectStack(skills);
  const techStack = buildTechStack(skills, detectedStack);

  const result = {
    title: base.title,
    description: base.description,
    features: [...new Set([...base.features, enhancement.feature])],
    techStack,
    estimatedTime: `${base.estimatedTime}${enhancement.timeNote}`,
    architecture: buildArchitecture(domain, skills, detectedStack),
    databaseSchema: buildDatabaseSchema(detectedStack),
    apiEndpoints: buildApiEndpoints(detectedStack),
    folderStructure: buildFolderStructure(detectedStack),
    roadmap: [
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
    ],
    resumePoints: buildResumePoints(skills, domain, difficulty, detectedStack),
    complexityScore: difficulty === "Beginner" ? 35 : difficulty === "Intermediate" ? 65 : 85,
    resumeBullets: buildResumeBullets(skills, domain, difficulty, detectedStack),
    improvements: [
      "Add caching layer to improve API response times by 50%",
      "Implement role-based access control (RBAC) for granular permissions",
      "Add comprehensive unit and integration testing suite",
      "Set up Docker containerization for consistent development and deployment",
      "Implement real-time features for live updates",
      "Add rate limiting and request throttling to prevent API abuse"
    ],
    alternatives: [
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
    ],
    techAdvisor: buildTechAdvisor(skills, detectedStack)
  };

  // Add architecture diagram
  Object.assign(result, buildArchitectureDiagram(skills, detectedStack));
  return result;
}

// ─── Architecture Diagram Nodes/Edges Builder ────────────────────────────────
function buildArchitectureDiagram(skills, detectedStack) {
  const stack = detectedStack || STACK_PATTERNS.mern;
  const frontend = stack.frontend[0] || "Frontend";
  const backend = stack.backend[0] || "Backend API";
  const database = stack.database[0] || "Database";
  const authTool = stack.tools.find(t => t.toLowerCase().includes("auth")) || "JWT Authentication";

  const nodes = [
    { id: "frontend", label: `Frontend\n(${frontend})` },
    { id: "backend", label: `Backend API\n(${backend})` },
    { id: "database", label: `Database\n(${database})` },
    { id: "auth", label: `Authentication\n(${authTool})` }
  ];

  const edges = [
    { source: "frontend", target: "backend" },
    { source: "backend", target: "database" },
    { source: "auth", target: "frontend" }
  ];

  // Add extra layers if stack has more components
  if (stack.database.includes("Redis")) {
    nodes.push({ id: "cache", label: "Cache\n(Redis)" });
    edges.push({ source: "backend", target: "cache" });
  }

  return { architectureNodes: nodes, architectureEdges: edges };
}

// Export helpers for gemini service fallback defaults
export {
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
  STACK_PATTERNS,
};

// ─── Template Fallback for Analyze Existing Project ───────────────────────────

export function analyzeProjectTemplate({ projectName }) {
  // Pick a reasonable default stack based on project name keywords
  const name = projectName.toLowerCase();
  let detectedStack;

  if (/java|spring|android/.test(name)) detectedStack = STACK_PATTERNS.java;
  else if (/python|django|flask|ml|ai|data/.test(name)) detectedStack = STACK_PATTERNS.python;
  else if (/.net|c#|asp/.test(name)) detectedStack = STACK_PATTERNS.dotnet;
  else if (/php|laravel/.test(name)) detectedStack = STACK_PATTERNS.php;
  else if (/go\b|golang/.test(name)) detectedStack = STACK_PATTERNS.go;
  else if (/ruby|rails/.test(name)) detectedStack = STACK_PATTERNS.ruby;
  else if (/rust/.test(name)) detectedStack = STACK_PATTERNS.rust;
  else detectedStack = STACK_PATTERNS.mern;

  const skills = [...detectedStack.frontend.slice(0, 2), ...detectedStack.backend.slice(0, 2), ...detectedStack.database.slice(0, 1)];
  const techStack = buildTechStack(skills, detectedStack);

  const result = {
    title: projectName,
    description: `A comprehensive ${projectName} application built with modern architecture, best practices, and production-ready patterns.`,
    features: [
      "User Authentication & Authorization",
      "Interactive Dashboard with Analytics",
      "CRUD Operations with Validation",
      "Advanced Search & Filtering",
      "Real-time Notifications",
      "Role-based Access Control",
      "Data Export & Reporting",
      "Responsive Design & Mobile Support"
    ],
    techStack,
    estimatedTime: "4-6 weeks",
    architecture: buildArchitecture("General", skills, detectedStack),
    databaseSchema: buildDatabaseSchema(detectedStack),
    apiEndpoints: buildApiEndpoints(detectedStack),
    folderStructure: buildFolderStructure(detectedStack),
    roadmap: [
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
    ],
    resumePoints: buildResumePoints(skills, "General", "Intermediate", detectedStack),
    complexityScore: 65,
    resumeBullets: buildResumeBullets(skills, "General", "Intermediate", detectedStack),
    improvements: [
      "Add caching layer to improve API response times by 50%",
      "Implement role-based access control (RBAC) for granular permissions",
      "Add comprehensive unit and integration testing suite",
      "Set up Docker containerization for consistent deployment",
      "Implement real-time features for live updates",
      "Add rate limiting and request throttling to prevent API abuse"
    ],
    alternatives: [
      { title: `${projectName} Pro`, description: `An enhanced version with advanced features and integrations`, difficulty: "Advanced" },
      { title: `${projectName} Lite`, description: `A simplified version for quick deployment and learning`, difficulty: "Beginner" },
      { title: `${projectName} API`, description: `A headless API-first version for microservice architecture`, difficulty: "Intermediate" }
    ],
    techAdvisor: buildTechAdvisor(skills, detectedStack)
  };

  Object.assign(result, buildArchitectureDiagram(skills, detectedStack));
  return result;
}
