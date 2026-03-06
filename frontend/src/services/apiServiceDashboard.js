// src/services/apiServiceDashboard.js

const API_URL = "https://myapi-backend.onrender.com/api";

// helper for query params
const buildQuery = (params) => {
  if (!params) return "";
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : "";
};

export const dashboardApi = {

  /* =====================================================
     QUESTIONS
  ===================================================== */

  // GET /api/questions
  getQuestions: (filters) =>
    fetch(`${API_URL}/questions${buildQuery(filters)}`).then(r => r.json()),

  // GET /api/questions/{id}
  getQuestionById: (id) =>
    fetch(`${API_URL}/questions/${id}`).then(r => r.json()),

  // POST /api/questions
  createQuestion: (data) =>
    fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // PUT /api/questions/{id}
  updateQuestion: (id, data) =>
    fetch(`${API_URL}/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // DELETE /api/questions/{id}
  deleteQuestion: (id) =>
    fetch(`${API_URL}/questions/${id}`, {
      method: "DELETE"
    }),

  // PATCH /api/questions/{id}/toggle-status
  toggleQuestionStatus: (id) =>
    fetch(`${API_URL}/questions/${id}/toggle-status`, {
      method: "PATCH"
    }),

  // PATCH /api/questions/{id}/version/increment
  incrementQuestionVersion: (id) =>
    fetch(`${API_URL}/questions/${id}/version/increment`, {
      method: "PATCH"
    }),

  // GET /api/questions/types
  getQuestionTypes: () =>
    fetch(`${API_URL}/questions/types`).then(r => r.json()),

  // GET /api/questions/topics
  getQuestionTopics: () =>
    fetch(`${API_URL}/questions/topics`).then(r => r.json()),


  /* =====================================================
     TRAINING PROGRAMS
  ===================================================== */

  // GET /api/training-programs
  getPrograms: (filters) =>
    fetch(`${API_URL}/training-programs${buildQuery(filters)}`).then(r => r.json()),

  // GET /api/training-programs/{id}
  getProgramById: (id) =>
    fetch(`${API_URL}/training-programs/${id}`).then(r => r.json()),

  // POST /api/training-programs
  createProgram: (data) =>
    fetch(`${API_URL}/training-programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // PUT /api/training-programs/{id}
  updateProgram: (id, data) =>
    fetch(`${API_URL}/training-programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // DELETE /api/training-programs/{id}
  deleteProgram: (id) =>
    fetch(`${API_URL}/training-programs/${id}`, {
      method: "DELETE"
    }),

  // PATCH /api/training-programs/{id}/toggle-status
  toggleProgramStatus: (id) =>
    fetch(`${API_URL}/training-programs/${id}/toggle-status`, {
      method: "PATCH"
    }),

  // PATCH /api/training-programs/{id}/version/increment
  incrementProgramVersion: (id) =>
    fetch(`${API_URL}/training-programs/${id}/version/increment`, {
      method: "PATCH"
    }),

  /* =====================================================
     PROGRAM MEDIA UPLOADS
  ===================================================== */

  uploadProgramVideo: (programId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_URL}/training-programs/${programId}/upload-video`, {
      method: "POST",
      body: formData
    }).then(r => r.json());
  },

  uploadProgramImage: (programId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_URL}/training-programs/${programId}/upload-image`, {
      method: "POST",
      body: formData
    }).then(r => r.json());
  },

  uploadProgramCase: (programId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_URL}/training-programs/${programId}/upload-case`, {
      method: "POST",
      body: formData
    }).then(r => r.json());
  },


  /* =====================================================
     PROGRAM QUESTIONS RELATION
  ===================================================== */

  // GET /api/programs/{programId}/questions
  getProgramQuestions: (programId) =>
    fetch(`${API_URL}/programs/${programId}/questions`).then(r => r.json()),

  // POST /api/programs/{programId}/questions
  addQuestionToProgram: (programId, data) =>
    fetch(`${API_URL}/programs/${programId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // PUT /api/programs/{programId}/questions/reorder
  reorderProgramQuestions: (programId, orderList) =>
    fetch(`${API_URL}/programs/${programId}/questions/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderList)
    }),

  // DELETE /api/programs/{programId}/questions/{questionId}
  removeQuestionFromProgram: (programId, questionId) =>
    fetch(`${API_URL}/programs/${programId}/questions/${questionId}`, {
      method: "DELETE"
    }),

  // GET available questions
  getAvailableQuestionsForProgram: (programId) =>
    fetch(`${API_URL}/programs/${programId}/questions/available`).then(r => r.json()),

  // GET programs containing a question
  getProgramsForQuestion: (questionId) =>
    fetch(`${API_URL}/questions/${questionId}/programs`).then(r => r.json()),


  /* =====================================================
     TRAINING SESSIONS (existing)
  ===================================================== */

  getSessions: () =>
    fetch(`${API_URL}/training-sessions`).then(r => r.json()),

  updateSessionStatus: (id, status) =>
    fetch(`${API_URL}/training-sessions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
};