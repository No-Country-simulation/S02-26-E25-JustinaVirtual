// src/components/hud/TrainingHUD.jsx
import { useTrainingSession } from '../../contexts/TrainingSessionContext';
import TimerDisplay from '../ui/TimerDisplay';
import ScoreDisplay from '../ui/ScoreDisplay';

export default function TrainingHUD() {
  const { session, currentStep } = useTrainingSession();

  if (!session) return null;

  const wrongAnswers = session.answers.filter(a => !a.isCorrect).length;

  return (
    <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none">
      <div className="flex justify-between items-center bg-black/70 backdrop-blur-sm p-4 rounded-lg max-w-4xl mx-auto text-white">
        <div>
          <div className="text-sm opacity-80">Etapa {currentStep + 1}/3</div>
          <div className="text-lg font-bold">{session.moduleId}</div>
        </div>

        <div className="flex gap-10">
          <TimerDisplay startTime={session.startTime} />
          <ScoreDisplay 
            current={session.totalScore} 
            max={session.answers.length || 1} 
          />
          <div className={wrongAnswers > 0 ? "text-red-400" : "text-green-400"}>
            Erros: {wrongAnswers}
          </div>
        </div>
      </div>
    </div>
  );
}