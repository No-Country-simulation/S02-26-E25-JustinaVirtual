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
    const finalSession = {
      ...session,
      endTime: new Date(),
      totalTimeMs: new Date() - session.startTime,
    };
    console.log("Sessão finalizada:", finalSession);
    setSession(null); // Opcional: limpa a sessão após finalizar
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

// DECLARAÇÃO ÚNICA DO HOOK NO FINAL DO ARQUIVO
export const useTrainingSession = () => {
  const context = useContext(TrainingSessionContext);
  if (!context) {
    throw new Error('useTrainingSession deve ser usado dentro de um TrainingSessionProvider');
  }
  return context;
};