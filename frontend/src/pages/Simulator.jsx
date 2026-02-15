import { useEffect, useState } from "react";
import RenalCanvas from "../canvas/RenalCanvas";

export default function Simulator() {
  const [medico, setMedico] = useState("Cirurgião");

  useEffect(() => {
    // Buscamos os dados que você salvou lá no RegistrationForm
    const dadosSalvos = localStorage.getItem("justina_user");
    if (dadosSalvos) {
      const objetoMedico = JSON.parse(dadosSalvos);
      setMedico(objetoMedico.name || "Cirurgião"); // Pega o nome do médico
    }
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Justina — Simulador Cirúrgico</h1>
          <p className="text-gray-400">Operador: <span className="text-white font-semibold">{medico}</span></p>
        </div>
        <div className="bg-blue-900/30 p-3 rounded border border-blue-500/50">
          <p className="text-xs uppercase tracking-widest text-blue-300">Status do Sistema</p>
          <p className="text-green-400 animate-pulse font-mono">● TELEMETRIA ATIVA</p>
        </div>
      </div>
      
      
      <div className="bg-black rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden">
        {/* Aqui é onde a cirurgia acontece - Sua lógica de Canvas */}
        <RenalCanvas />
      </div>
      
      <p className="mt-4 text-sm text-gray-500 italic">
        * Use o mouse ou controlador para interagir com o ambiente renal simulado.
      </p>
    </div>
  );
}