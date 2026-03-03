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
    if (formData.name.trim().split(/\s+/).length < 2) {
      return "Por favor, insira o nome completo do operador.";
    }
    if (formData.role !== "TRAINEE" && !formData.crm.trim()) {
      return "O registro profissional (CRM) é obrigatório para este nível de atuação.";
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
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        crm: formData.role === "TRAINEE" ? "" : formData.crm.trim()
      };
      await apiService.registerUser(cleanedData);
      navigate("/simulator");
    } catch (error) {
      setErrorMessage(
        error?.message
          ? error.message
          : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-md mx-auto">
      <header className="mb-10 group">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
              Justina <span className="text-blue-500 font-extralight italic tracking-normal ml-1">Virtual</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-8 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-bold text-blue-400/70 uppercase tracking-[0.2em]">
                Clinical Simulation
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
            <div className="absolute inset-0 h-3 w-3 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <div className="relative mt-6">
          <p className="text-slate-400 text-[11px] leading-relaxed font-medium pl-4 border-l border-slate-700/50">
            Interface integrada para validação de habilidades e <span className="text-slate-200">mapeamento de performance em tempo real.</span>
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-slate-800 via-blue-900/30 to-transparent mt-8"></div>
      </header>

      {errorMessage && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 text-[11px] p-3 rounded-xl mb-6 animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
            Nome Completo
          </label>
          <input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            placeholder="Ex: Ana Maria de Souza"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
            Email
          </label>
          <input 
            autoComplete="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            placeholder="usuario@instituicao.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
            Senha
          </label>
          <input 
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
            Perfil de Acesso
          </label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white cursor-pointer outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500"
          >
            <option value="TRAINEE">Estudante</option>
            <option value="USER">Profissional / Médico</option>
            <option value="ADMIN">Supervisor / ADMIN</option>
          </select>
        </div>

        {formData.role !== "TRAINEE" && (
          <div className="space-y-1 animate-in zoom-in-95 duration-200">
            <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
              Registro de Classe
            </label>
            <input 
              name="crm" 
              value={formData.crm}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              placeholder="CRM e UF (Ex: 123456-SP)"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-4 rounded-xl transition-all font-semibold text-sm tracking-wide mt-4 shadow-lg active:scale-[0.98]
          ${loading 
            ? "bg-slate-700 cursor-not-allowed text-white opacity-70" 
            : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/20"}`}
        >
          {loading ? "Validando acesso..." : "Registrar"}
        </button>

        <p className="text-[10px] text-slate-500 text-center mt-4 leading-relaxed px-4">
          O acesso ao ambiente virtual Justina implica na concordância com a coleta de telemetria para fins de análise técnica.
        </p>
      </form>
    </div>
  );
}