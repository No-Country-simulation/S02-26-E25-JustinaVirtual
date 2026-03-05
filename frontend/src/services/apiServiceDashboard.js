// src/services/apiServiceDashboard.js

const API_URL = "https://myapi-backend.onrender.com/api";

export const dashboardApi = {

  // QUESTIONS
  getQuestions: () => fetch(`${API_URL}/questions`).then(r => r.json()),
  createQuestion: (data) =>
    fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateQuestion: (id, data) =>
    fetch(`${API_URL}/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }),

  deleteQuestion: (id) =>
    fetch(`${API_URL}/questions/${id}`, { method: "DELETE" }),

  // TRAINING PROGRAMS
  getPrograms: () =>
    fetch(`${API_URL}/training-programs`).then(r => r.json()),

  // TRAINING SESSIONS
  getSessions: () =>
    fetch(`${API_URL}/training-sessions`).then(r => r.json()),

  updateSessionStatus: (id, status) =>
    fetch(`${API_URL}/training-sessions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
};