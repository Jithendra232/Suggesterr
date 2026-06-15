const API_URL = import.meta.env.VITE_API_URL;

/**
 * Attempts to get a valid Clerk token, retrying with exponential backoff.
 * Clerk can return null briefly during initialization even when the user IS signed in.
 * We retry up to MAX_TOKEN_RETRIES times before giving up.
 */
const MAX_TOKEN_RETRIES = 3;
const TOKEN_RETRY_BASE_MS = 300;

async function getValidToken(getToken) {
  for (let attempt = 0; attempt < MAX_TOKEN_RETRIES; attempt++) {
    const token = await getToken();
    if (token) return token;

    if (attempt < MAX_TOKEN_RETRIES - 1) {
      // Exponential backoff: 300ms, 600ms, 1200ms
      await new Promise((r) => setTimeout(r, TOKEN_RETRY_BASE_MS * Math.pow(2, attempt)));
    }
  }
  return null;
}

async function request(path, options = {}, getToken) {
  const token = await getValidToken(getToken);

  if (!token) {
    // Tag this error so callers can distinguish "Clerk still initializing"
    // from an actual server-side authentication failure.
    const err = new Error("Authentication is still initializing. Please wait.");
    err.isAuthInitError = true;
    throw err;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function publicRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ─── Existing Project APIs ───────────────────────────────────────────────────

export function createProject(payload, getToken) {
  return request("/api/projects", { method: "POST", body: JSON.stringify(payload) }, getToken);
}

export function analyzeProject(projectName, projectDescription, getToken) {
  return request("/api/projects/analyze", { method: "POST", body: JSON.stringify({ projectName, projectDescription }) }, getToken);
}

export function reverseEngineerProject(productName, getToken) {
  return request("/api/projects/reverse-engineer", { method: "POST", body: JSON.stringify({ productName }) }, getToken);
}

export function getProjects(getToken) {
  return request("/api/projects", {}, getToken);
}

export function getProject(id, getToken) {
  return request(`/api/projects/${id}`, {}, getToken);
}

export function deleteProject(id, getToken) {
  return request(`/api/projects/${id}`, { method: "DELETE" }, getToken);
}

// ─── Feature 1: Analytics ────────────────────────────────────────────────────

export function getAnalytics(getToken) {
  return request("/api/analytics", {}, getToken);
}

// ─── Feature 2: Versioning ───────────────────────────────────────────────────

export function createProjectVersion(id, getToken) {
  return request(`/api/projects/${id}/versions`, { method: "POST" }, getToken);
}

export function getProjectVersions(id, getToken) {
  return request(`/api/projects/${id}/versions`, {}, getToken);
}

// ─── Feature 4: Shareable Links ──────────────────────────────────────────────

export function generateShareLink(id, getToken) {
  return request(`/api/projects/${id}/share`, { method: "POST" }, getToken);
}

export function getSharedProject(shareId) {
  return publicRequest(`/api/projects/shared/${shareId}`);
}

// ─── Feature 5: Interview Questions ──────────────────────────────────────────

export function generateInterviewQuestions(id, getToken) {
  return request(`/api/projects/${id}/interview-questions`, { method: "POST" }, getToken);
}

// ─── Feature 6: Documentation ────────────────────────────────────────────────

export function fetchDocumentation(id, getToken) {
  return request(`/api/projects/${id}/documentation`, {}, getToken);
}

export function generateProjectDocumentation(id, getToken) {
  return request(`/api/projects/${id}/documentation`, { method: "POST" }, getToken);
}

// ─── Feature 7: GitHub Planner ───────────────────────────────────────────────

export function fetchGitHubPlanner(id, getToken) {
  return request(`/api/projects/${id}/github-planner`, {}, getToken);
}

export function generateGitHubPlanner(id, getToken) {
  return request(`/api/projects/${id}/github-planner`, { method: "POST" }, getToken);
}

// ─── Feature 8: Learning Roadmap ─────────────────────────────────────────────

export function fetchLearningRoadmap(id, getToken) {
  return request(`/api/projects/${id}/learning-roadmap`, {}, getToken);
}

export function generateLearningRoadmap(id, getToken) {
  return request(`/api/projects/${id}/learning-roadmap`, { method: "POST" }, getToken);
}

export function updateLearningProgress(id, sectionIndex, topicIndex, completed, getToken) {
  return request(
    `/api/projects/${id}/learning-roadmap/progress`,
    { method: "PUT", body: JSON.stringify({ sectionIndex, topicIndex, completed }) },
    getToken
  );
}

// ─── Feature 9: Recruiter Analysis ───────────────────────────────────────────

export function fetchRecruiterAnalysis(id, getToken) {
  return request(`/api/projects/${id}/recruiter-analysis`, {}, getToken);
}

export function generateRecruiterAnalysis(id, getToken) {
  return request(`/api/projects/${id}/recruiter-analysis`, { method: "POST" }, getToken);
}

// ─── New Features: Lazy-load AI sections ────────────────────────────────────

export function fetchProjectDescription(id, getToken) {
  return request(`/api/projects/${id}/project-description`, {}, getToken);
}

export function fetchCommonMistakes(id, getToken) {
  return request(`/api/projects/${id}/common-mistakes`, {}, getToken);
}

export function fetchScalabilitySuggestions(id, getToken) {
  return request(`/api/projects/${id}/scalability-suggestions`, {}, getToken);
}

export function fetchIndustryImprovements(id, getToken) {
  return request(`/api/projects/${id}/industry-improvements`, {}, getToken);
}

export function fetchReadme(id, getToken) {
  return request(`/api/projects/${id}/readme`, {}, getToken);
}

export function fetchResumeDescription(id, getToken) {
  return request(`/api/projects/${id}/resume-description`, {}, getToken);
}

export function fetchArchitectureExplanation(id, getToken) {
  return request(`/api/projects/${id}/architecture-explanation`, {}, getToken);
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export function updateProjectProgress(id, progressStatus, progressPercent, getToken) {
  return request(
    `/api/projects/${id}/progress`,
    { method: "PUT", body: JSON.stringify({ progressStatus, progressPercent }) },
    getToken
  );
}

// ─── AI Mentor Chat ──────────────────────────────────────────────────────────

export function chatWithProject(id, message, getToken) {
  return request(`/api/projects/${id}/chat`, { method: "POST", body: JSON.stringify({ message }) }, getToken);
}
