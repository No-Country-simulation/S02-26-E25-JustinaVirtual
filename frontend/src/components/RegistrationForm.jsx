import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainingSession } from "../contexts/TrainingSessionContext";

export default function RegistrationForm({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const { startSession } = useTrainingSession();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // 1. Forçar Nome em CAIXA ALTA (Padrão Hospitalar)
    if (name === "name") {
      formattedValue = value.toUpperCase();
    }

    // 2. Máscara de WhatsApp (11) 99999-9999
    if (name === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 11) {
        formattedValue = numbers
          .replace(/^(\d{2})(\d)/g, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2");
      } else {
        formattedValue = formData.phone; 
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 🔐 PASSO 1: Iniciar sessão real no Backend (Auditoria Ativa)
      // Usamos o DNI como identificador único para o banco de dados
      await startSession("MODULO_RENAL_V1", formData.dni);

      // 💾 PASSO 2: Persistência local para resiliência do simulador
      localStorage.setItem("justina_user", JSON.stringify(formData));
      
      // 🚀 PASSO 3: Callback e Navegação
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      console.log("✅ Conexão FE-5 Estabilizada. Médico Registrado:", formData.name);
      navigate("/simulator"); 

    } catch (error) {
      console.error("🚨 Erro Crítico no Registro:", error);
      alert("Falha na comunicação com o servidor Justina. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-blue-500/10 rounded-full mb-2">
          <span className="text-3xl">🩺</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
          Registro do Médico
        </h2>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">
          Protocolo Virtual Justina
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">DNI / ID</label>
            <input 
              name="dni"
              value={formData.dni}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
              placeholder="12345678" 
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Senha</label>
            <input 
              name="password"
              type="password"
              value={formData.password}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
              placeholder="••••••" 
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
          <input 
            name="name"
            value={formData.name}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
            placeholder="DR. NOME EXEMPLO" 
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-5 gap-3">
           <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail Acadêmico</label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                onChange={handleChange}
                required
              />
           </div>
           <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">WhatsApp</label>
              <input 
                name="phone"
                type="tel"
                value={formData.phone}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                placeholder="(00) 00000-0000" 
                onChange={handleChange}
                required
              />
           </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nível de Acesso</label>
          <select 
            name="role"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white cursor-pointer outline-none text-sm"
            onChange={handleChange}
            value={formData.role}
          >
            <option value="ADMIN">ADMIN (Professor)</option>
            <option value="USER">USER (Residente)</option>
            <option value="TRAINEE">TRAINEE (Estudante)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-4 rounded-xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg mt-4 ${
            isSubmitting ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {isSubmitting ? "Conectando ao Protocolo..." : "Iniciar Protocolo 🚀"}
        </button>
      </form>
      
      <p className="text-[9px] text-slate-600 font-mono text-center mt-6 uppercase">
        Auth System FE-5 // Telemetry DD-Ready // v1.0.4
      </p>
    </div>
  );
}