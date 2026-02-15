import { useEffect } from 'react';
import { useTrainingSession } from '../contexts/TrainingSessionContext';
import TrainingHUD from '../components/hud/TrainingHUD';
import QuestionMultipleChoice from '../components/training/QuestionMultipleChoice';
import ImagemRimPelveRenal from '../assets/ImagemRimPelveRenal.jpg';

// ... (mantenha os arrays de questões videoQuestions, imageQuestions, etc. aqui)

export default function TrainingSessionPage() {
  const video1 = "https://www.youtube.com/embed/fELn4Fe9Ccc";

  // LOG DE DIAGNÓSTICO
  console.log("Contexto atual:", context);
  console.log("Passo atual:", context?.currentStep);

  if (!context) {
    return <div className="p-20 text-red-500">Erro: Provider não encontrado no App.jsx</div>;
  }

  const { session, startSession, recordAnswer, currentStep, finishStep, finishSession } = context;

  useEffect(() => {
    if (!session) {
      console.log("Iniciando nova sessão...");
      startSession('Treinamento Renal', 'dr-' + Date.now());
    }
  }, [session, startSession]);

  if (!session) return <div className="p-20 text-white">Carregando Sessão...</div>;

  // Lógica para pegar questões do passo atual
  const questions = currentStep === 0 ? videoQuestions : (currentStep === 1 ? imageQuestions : caseQuestions);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <TrainingHUD />

      <div className="container mx-auto pt-28 px-6 max-w-4xl">
        {/* INDICADOR DE DEPURAÇÃO - REMOVA DEPOIS */}
        <div className="bg-blue-900/20 p-2 text-[10px] mb-4 rounded border border-blue-500/30 text-blue-400 font-mono">
          DEBUG: Passo {currentStep} | Questões na lista: {questions?.length}
        </div>

        {currentStep <= 2 ? (
          <section className="animate-in fade-in duration-700">
            <h2 className="text-3xl font-bold mb-4">
              {currentStep === 0 && "Etapa 1: Anatomia em Vídeo"}
              {currentStep === 1 && "Etapa 2: Análise de Imagem"}
              {currentStep === 2 && "Etapa 3: Tomada de Decisão"}
            </h2>

            {/* VÍDEO - ETAPA 0 */}
            {currentStep === 0 && (
              <div className="mb-10 aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={video1}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* QUESTÕES */}
            <div className="space-y-8 mt-10">
              {questions && questions.length > 0 ? (
                questions.map((q) => (
                  <QuestionMultipleChoice
                    key={q.id}
                    question={q}
                    onAnswer={(ans) => recordAnswer(ans)}
                  />
                ))
              ) : (
                <p className="text-red-400">Aviso: Nenhuma questão encontrada para este passo.</p>
              )}
            </div>

            {/* BOTÃO PROXIMO */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={finishStep}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg"
              >
                {currentStep === 2 ? "Finalizar" : "Próxima Etapa"}
              </button>
            </div>
          </section>
        ) : (
          <div className="text-center p-10 bg-slate-900 rounded-3xl border border-slate-800">
            <h2 className="text-4xl font-black text-green-400 mb-4">SUCESSO!</h2>
            <p className="text-xl mb-8">Treinamento concluído com {session.totalScore} pontos.</p>
            <button onClick={finishSession} className="bg-white text-black px-8 py-3 rounded-full font-bold">
              Salvar no Prontuário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const useTrainingSession = () => useContext(TrainingSessionContext);