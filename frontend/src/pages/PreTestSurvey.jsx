import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreTestSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

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
      // ✅ Após a última pergunta, vai para o simulador
      navigate("/simulator"); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl text-center">
        <div className="mb-6">
          <span className="text-blue-500 font-mono text-[10px] tracking-widest uppercase bg-blue-500/10 px-3 py-1 rounded-full">
            Pré-Avaliação Cirúrgica
          </span>
        </div>
        
        <h2 className="text-2xl text-white font-black mb-8 leading-tight">
          {questions[step]}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
           <button onClick={handleNext} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20">Sim</button>
           <button onClick={handleNext} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-bold transition-all">Não</button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 w-8 rounded-full transition-all ${i === step ? "bg-blue-500" : "bg-slate-800"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}