import { createContext, useContext, useState } from 'react';
import { apiService } from "../services/apiService";

const TrainingSessionContext = createContext(null);

export function TrainingSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Mudamos para async para esperar a resposta do servidor
  const startSession = async (moduleId, traineeId) => {
    try {
      console.log("Tentando iniciar sessão no Backend...");
      const remoteSession = await apiService.startSession();
      
      // Se chegamos aqui, o Backend da Stephanny criou a sessão no H2!
      setSession({
        ...remoteSession, // ID, status, etc., que vêm do Java
        answers: [],
        totalScore: 0
      });
    } catch (error) {
      console.warn("Backend offline ou erro 409. Usando sessão local de contingência.");
      // Fallback: modo offline para você não parar de trabalhar
      setSession({
        id: 'LOCAL-' + Date.now(),
        traineeId,
        moduleId,
        startTime: new Date(),
        answers: [],
        totalScore: 0
      });
    }
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

  // Agora finaliza de verdade no servidor também
  const finishSession = async () => {
    if (session && !session.id.startsWith('LOCAL-')) {
      try {
        await apiService.finishSession(session.id);
        console.log("Sessão encerrada com sucesso no Backend.");
      } catch (error) {
        console.error("Erro ao finalizar no servidor:", error.message);
      }
    }
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