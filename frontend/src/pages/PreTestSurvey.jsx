import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreTestSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const questions = [
    "Qual o tempo máximo recomendado para isquemia renal?",
    "Identifique a artéria principal de acesso ao parênquima.",
    "O uso de telemetria melhora a curva de aprendizado?",
    "Você já realizou simulações virtuais anteriormente?",
    "Confirmar início do protocolo de monitoramento Justina?"
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/simulator"); // Finalmente vai para o simulador
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
        <span className="text-blue-500 font-mono text-xs">PERGUNTA {step + 1} DE 5</span>
        <h2 className="text-xl text-white font-bold mt-4 mb-8">{questions[step]}</h2>
        
        <div className="flex flex-col gap-3">
           <button onClick={handleNext} className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Sim / Confirmar</button>
           <button onClick={handleNext} className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Não / Recusar</button>
        </div>
      </div>
    </div>
  );
}