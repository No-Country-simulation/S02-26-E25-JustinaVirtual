import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "name" ? value.toUpperCase() : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Enviando para o Backend Justina:", formData);
      localStorage.setItem("justina_user", JSON.stringify(formData));
      if (onRegisterSuccess) onRegisterSuccess();
      navigate("/survey"); 
    } catch (error) {
      alert("Erro ao conectar com o sistema de autenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-md mx-auto relative overflow-hidden">
      
      {/* O BANNER DE TOPO FOI REMOVIDO DAQUI PARA LIMPAR A TELA INICIAL */}

      <div className="text-center mb-8 mt-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Acesso Acadêmico</h2>
        <p className="text-slate-500 text-[10px] uppercase font-mono">Autenticação Simples Justina</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
          <input 
            name="name" 
            onChange={handleChange} 
            required 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail</label>
          <input 
            name="email" 
            type="email" 
            onChange={handleChange} 
            required 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Senha</label>
            <input 
              name="password" 
              type="password" 
              onChange={handleChange} 
              required 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Perfil</label>
            <select 
              name="role" 
              onChange={handleChange} 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm cursor-pointer"
            >
              <option value="USER">ALUNO</option>
              <option value="ADMIN">PROFESSOR</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all mt-4 shadow-lg active:scale-95"
        >
          {isSubmitting ? "Validando..." : "Ir para Questionário →"}
        </button>
      </form>
    </div>
  );
}