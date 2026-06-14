const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}, getToken) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

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

export function analyzeProject(projectName, getToken) {
  return request("/api/projects/analyze", { method: "POST", body: JSON.stringify({ projectName }) }, getToken);
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
