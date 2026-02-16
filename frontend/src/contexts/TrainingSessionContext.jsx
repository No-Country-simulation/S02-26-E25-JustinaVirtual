import { createContext, useContext, useState } from 'react';

const TrainingSessionContext = createContext(null);

export function TrainingSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const startSession = (moduleId, traineeId) => {
    // Por enquanto local, mas preparado para o POST /api/sessoes/iniciar
    setSession({
      id: Date.now().toString(),
      traineeId,
      moduleId,
      startTime: new Date(),
      answers: [],
      totalScore: 0
    });
    setCurrentStep(0);
  };

  const recordAnswer = (answerRecord) => {
    if (!session) return;
    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, answerRecord],
      totalScore: prev.totalScore + (answerRecord.isCorrect ? 1 : 0),
    }));
  };

  const finishStep = () => setCurrentStep(prev => prev + 1);

  const finishSession = () => {
    console.log("Finalizando sessão no backend...");
    setSession(null);
  };

  return (
    <TrainingSessionContext.Provider value={{ session, startSession, recordAnswer, finishStep, finishSession, currentStep }}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export const useTrainingSession = () => {
  const context = useContext(TrainingSessionContext);
  if (!context) throw new Error('useTrainingSession deve ser usado dentro de um Provider');
  return context;
};