import { useEffect } from 'react';
import { useTrainingSession } from '../contexts/TrainingSessionContext';
import TrainingHUD from '../components/hud/TrainingHUD';
import QuestionMultipleChoice from '../components/training/QuestionMultipleChoice';
import ImagemRimPelveRenal from '../assets/ImagemRimPelveRenal.jpg';

// Arrays de questões (Certifique-se que estão definidos aqui ou importados)
const videoQuestions = [
  { id: 'v1', text: 'Questão de vídeo 1...', options: ['A', 'B', 'C'], correctIndex: 0 }
];
const imageQuestions = [
  { id: 'i1', text: 'Questão de imagem 1...', options: ['A', 'B', 'C'], correctIndex: 1 }
];
const caseQuestions = [
  { id: 'c1', text: 'Questão de caso 1...', options: ['A', 'B', 'C'], correctIndex: 2 }
];

export default function TrainingSessionPage() {
  const video1 = "https://www.youtube.com/embed/fELn4Fe9Ccc";
  
  // 1. CHAME O CONTEXTO AQUI
  const context = useTrainingSession();

  // LOG DE DIAGNÓSTICO
  console.log("Contexto atual:", context);

  if (!context) {
    return <div className="p-20 text-red-500">Erro: Provider não encontrado.</div>;
  }

  const { session, startSession, recordAnswer, currentStep, finishStep, finishSession } = context;

  useEffect(() => {
    if (!session) {
      startSession('Treinamento Renal', 'dr-' + Date.now());
    }
  }, [session, startSession]);

  if (!session) return <div className="p-20 text-white">Carregando Sessão...</div>;

  const questions = currentStep === 0 ? videoQuestions : (currentStep === 1 ? imageQuestions : caseQuestions);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <TrainingHUD />

      <div className="container mx-auto pt-28 px-6 max-w-4xl">
        <div className="bg-blue-900/20 p-2 text-[10px] mb-4 rounded border border-blue-500/30 text-blue-400 font-mono">
          DEBUG: Passo {currentStep} | Questões: {questions?.length}
        </div>

        {currentStep <= 2 ? (
          <section>
            <h2 className="text-3xl font-bold mb-4">Etapa {currentStep + 1}</h2>
            
            {currentStep === 0 && (
              <div className="mb-10 aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
                <iframe width="100%" height="100%" src={video1} title="Video" frameBorder="0" allowFullScreen></iframe>
              </div>
            )}

            <div className="space-y-8 mt-10">
              {questions.map((q) => (
                <QuestionMultipleChoice key={q.id} question={q} onAnswer={recordAnswer} />
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button onClick={finishStep} className="px-10 py-4 bg-blue-600 rounded-xl font-bold">
                {currentStep === 2 ? "Finalizar" : "Próxima Etapa"}
              </button>
            </div>
          </section>
        ) : (
          <div className="text-center p-10 bg-slate-900 rounded-3xl border border-slate-800">
            <h2 className="text-4xl font-black text-green-400 mb-4">SUCESSO!</h2>
            <p className="text-xl mb-8">Score: {session.totalScore}</p>
            <button onClick={finishSession} className="bg-white text-black px-8 py-3 rounded-full font-bold">
              Salvar Sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const useTrainingSession = () => useContext(TrainingSessionContext);