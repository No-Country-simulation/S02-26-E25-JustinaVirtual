// src/contexts/TrainingSessionContext.jsx
import { createContext, useContext, useState } from 'react';

const TrainingSessionContext = createContext(null);

export function TrainingSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const startSession = (moduleId, traineeId) => {
    setSession({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      traineeId,
      moduleId,
      startTime: new Date(),
      stepsCompleted: 0,
      answers: [],
      totalScore: 0,
      totalTimeMs: 0,
      majorErrors: 0,
    });
    setCurrentStep(0);
  };

  const recordAnswer = (answerRecord) => {
    if (!session) return;

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, answerRecord],
      totalScore: prev.totalScore + (answerRecord.isCorrect ? 1 : 0),
      majorErrors: prev.majorErrors + (answerRecord.isCorrect ? 0 : 1),
    }));
  };

  const finishStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const finishSession = () => {
    if (!session) return;
    setSession(prev => ({
      ...prev,
      endTime: new Date(),
      totalTimeMs: new Date() - prev.startTime,
    }));
    // Here you would usually send to backend
    console.log("Sessão finalizada:", session);
  };

  return (
    <TrainingSessionContext.Provider 
      value={{ 
        session, 
        startSession, 
        recordAnswer, 
        finishStep, 
        finishSession, 
        currentStep 
      }}
    >
      {children}
    </TrainingSessionContext.Provider>
  );
}

export const useTrainingSession = () => useContext(TrainingSessionContext);