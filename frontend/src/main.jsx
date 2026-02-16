import { useState } from 'react';
import { useTrainingSession } from '../contexts/TrainingSessionContext';
import { useNavigate } from 'react-router-dom';

export default function MainSection() {
  const { startSession } = useTrainingSession();
  const navigate = useNavigate();

  // Estados para capturar o formulário
  const [formData, setFormData] = useState({
    dni: '',
    nome: '',
    nivel: 'USUARIO'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Inicia a sessão no Backend (Stephanny) através do Contexto
    // Passamos o DNI como identificador do trainee
    await startSession("CIRURGIA_RENAL_01", formData.dni);
    
    // 2. Com a sessão iniciada, vamos para a página de treinamento
    navigate('/training');
  };

  return (
    <section className="p-8 bg-gray-900 rounded-xl shadow-2xl max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-white mb-6">Registro do Médico</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-400 block mb-1">DNI/ID</label>
          <input 
            type="text" 
            required
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700"
            onChange={(e) => setFormData({...formData, dni: e.target.value})}
          />
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Nome Completo (CAIXA ALTA)</label>
          <input 
            type="text" 
            required
            style={{ textTransform: 'uppercase' }}
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700"
            onChange={(e) => setFormData({...formData, nome: e.target.value.toUpperCase()})}
          />
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all">
          Iniciar Protocolo 🚀
        </button>
      </form>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        v1.0.4 // Telemetria DD-Ready
      </p>
    </section>
  );
}