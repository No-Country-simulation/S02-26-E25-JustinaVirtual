import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";

export default function RegistrationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TRAINEE",
    crm: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);

      await apiService.registerUser(formData);

      navigate("/simulator");

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-md mx-auto">
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          Portal Justina
        </h2>
        <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest mt-1">
          Identity Management System
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-900/40 border border-red-600 text-red-300 text-xs p-3 rounded-xl mb-4">
          {errorMessage}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            Nome Completo
          </label>
          <input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            E-mail Acadêmico
          </label>
          <input 
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="medico@hospital.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            Senha de Acesso
          </label>
          <input 
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            Nível Hierárquico
          </label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white cursor-pointer outline-none text-sm"
          >
            <option value="TRAINEE">TRAINEE (Estudante)</option>
            <option value="USER">USER (Residente)</option>
            <option value="ADMIN">ADMIN (Administrador)</option>
          </select>
        </div>
    
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CRM (Opcional para Estudantes)</label>
          <input 
            name="crm" 
            value={formData.crm}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
            placeholder="123456-UF" 
            onChange={handleChange}          
          />
      </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest mt-4 shadow-lg
          ${loading 
            ? "bg-slate-700 cursor-not-allowed text-white" 
            : "bg-blue-600 hover:bg-blue-500 text-white"}`}
        >
          {loading ? "Processando..." : "Registrar e Iniciar 🚀"}
        </button>
      </form>
    </div>
  );
}