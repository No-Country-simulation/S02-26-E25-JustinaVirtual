// src/mocks/sessions.js

const now = new Date().toISOString();

export const mockSessions = [
  {
    id: "2208c720-92a9-40bf-8b11-3a9e52f627c1",
    traineeId: "trainee-1772021683115",
    programId: "Anatomia e Indicações em Cirurgia Renal",

    startTime: "2026-02-25T12:14:43.115Z",
    endTime: "2026-02-25T12:15:31.393Z",
    totalTimeMs: 48279,

    totalScore: 4,
    totalQuestions: 5,
    majorErrors: 1,

    status: "completed",

    answers: [
      {
        questionId: "v1",
        questionType: "video",
        selectedIndex: 0,
        isCorrect: true,
        timeSpentMs: 10057,
        answeredAt: "2026-02-25T12:14:53.181Z"
      },
      {
        questionId: "v2",
        questionType: "video",
        selectedIndex: 1,
        isCorrect: true,
        timeSpentMs: 14299,
        answeredAt: "2026-02-25T12:14:57.425Z"
      },
      {
        questionId: "i1",
        questionType: "image",
        selectedIndex: 0,
        isCorrect: true,
        timeSpentMs: 4657,
        answeredAt: "2026-02-25T12:15:03.422Z"
      },
      {
        questionId: "i2",
        questionType: "image",
        selectedIndex: 1,
        isCorrect: true,
        timeSpentMs: 8024,
        answeredAt: "2026-02-25T12:15:06.789Z"
      },
      {
        questionId: "c1",
        questionType: "case",
        selectedIndex: 2,
        isCorrect: false,
        timeSpentMs: 2157,
        answeredAt: "2026-02-25T12:15:10.845Z"
      }
    ],

    created_at: now,
    updated_at: now
  },

  // Example abandoned session
  {
    id: "abandoned-001",
    traineeId: "trainee-998877",
    programId: "Programa Padrão – Anatomia e Indicações em Cirurgia Renal",
    startTime: "2026-02-20T10:00:00Z",
    endTime: "2026-02-20T10:05:00Z",
    totalTimeMs: 300000,
    totalScore: 1,
    totalQuestions: 2,
    majorErrors: 1,
    status: "abandoned",
    answers: [],
    created_at: now,
    updated_at: now
  }
];