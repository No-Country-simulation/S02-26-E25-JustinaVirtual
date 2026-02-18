import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreTestSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const questions = [
    "O paciente apresenta histórico de alergia a contrastes?",
    "A pressão arterial sistólica está acima de 120mmHg?",
    "Os equipamentos de telemetria foram calibrados hoje?",
    "Você revisou o protocolo de isquemia renal Justina?",
    "Confirma o início da simulação com braço robótico?"
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // ✅ Ativa a tela de "Carregamento Demo" antes de ir para o simulador
      setIsLoadingDemo(true);
      
      // Simula um tempo de calibração de 3.5 segundos
      setTimeout(() => {
        navigate("/simulator"); 
      }, 3500);
    }
  };

  // --- TELA DE IMPACTO (SPLASH SCREEN) ---
  if (isLoadingDemo) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        {/* Spinner de Carregamento */}
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-8"></div>
        
        <div className="space-y-4">
          <h2 className="text-blue-400 font-mono text-[10px] tracking-[0.5em] uppercase animate-pulse">
            Iniciando Protocolo Justina
          </h2>
          <h1 className="text-white text-4xl font-black uppercase italic tracking-tighter">
            Simulação DEMO v1.0
          </h1>
          <p className="text-slate-500 font-mono text-[10px] max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
            Aguardando calibração da telemetria e sincronização do braço robótico...
          </p>
        </div>

        {/* Barra de Progresso Animada */}
        <div className="w-64 h-[2px] bg-slate-900 rounded-full mt-12 overflow-hidden">
          <div className="h-full bg-blue-600 animate-progress-run"></div>
        </div>

        {/* Estilo Local para a animação da barra */}
        <style>{`
          @keyframes progress-run {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress-run {
            animation: progress-run 3.5s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  // --- INTERFACE DO QUESTIONÁRIO ---
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl text-center">
        <div className="mb-6">
          <span className="text-blue-500 font-mono text-[10px] tracking-widest uppercase bg-blue-500/10 px-3 py-1 rounded-full">
            Pré-Avaliação Cirúrgica
          </span>
        </div>
        
        <h2 className="text-2xl text-white font-black mb-8 leading-tight h-24 flex items-center justify-center">
          {questions[step]}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={handleNext} 
             className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
           >
             Sim
           </button>
           <button 
             onClick={handleNext} 
             className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-bold transition-all active:scale-95"
           >
             Não
           </button>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${
                i === step ? "bg-blue-500 w-12" : "bg-slate-800 w-6"
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}