import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    comments: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("justina_user", JSON.stringify(formData));
      console.log("✅ Integração FE-5: Payload com Telefone/DD gerado.", formData);
      alert(`Acesso autorizado: Dr. ${formData.name}.`);
      navigate("/simulator"); 
    } catch (error) {
      console.error("Erro no registro:", error);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-500/10 rounded-full mb-2">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
            Registro do Médico
          </h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">
            Justina Virtual Protocol
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">DNI / ID</label>
              <input 
                name="dni"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
                placeholder="12345678" 
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Password</label>
              <input 
                name="password"
                type="password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
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
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="Dr. Nome Exemplo" 
              onChange={handleChange}
              required
            />
          </div>

          {/* E-mail e Telefone (DD) lado a lado para otimizar espaço */}
          <div className="grid grid-cols-5 gap-3">
             <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail Acadêmico</label>
                <input 
                  name="email"
                  type="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                  placeholder="med@hosp.com" 
                  onChange={handleChange}
                  required
                />
             </div>
             <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">WhatsApp (DD)</label>
                <input 
                  name="phone"
                  type="tel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                  placeholder="(85) 9..." 
                  onChange={handleChange}
                  required
                />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nível de Acesso</label>
            <select 
              name="role"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 mt-4"
          >
            Iniciar Protocolo 🚀
          </button>
        </form>

        <p className="text-[9px] text-slate-600 font-mono text-center mt-6 uppercase tracking-tighter">
          Auth System FE-5 // Telemetry DD-Ready // v1.0.4
        </p>
      </div>
    </div>
  );
}