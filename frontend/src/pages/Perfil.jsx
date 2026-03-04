import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

export default function Perfil() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordStrength = formData.password.length === 0 ? 0 : 
                          formData.password.length < 6 ? 33 : 
                          formData.password.length < 10 ? 66 : 100;

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "DISCREPÂNCIA DE SENHA DETECTADA" });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const updated = await apiService.updateProfile({
        name: formData.name,
        password: formData.password || null,
      });

      login(updated);
      localStorage.setItem("justina_user", JSON.stringify(updated));
      setStatus({ type: "success", message: "PROTOCOLO DE ATUALIZAÇÃO CONCLUÍDO" });
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setStatus({ type: "error", message: "FALHA NO SISTEMA: " + (err.message).toUpperCase() });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white p-4 font-sans overflow-hidden">
   
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full animate-[ping_5s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/10 rounded-full"></div>
      </div>

      <div className="relative w-full max-w-xl group">       
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-500 transition-all group-hover:scale-110"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-500 transition-all group-hover:scale-110"></div>

        <div className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)]">
          
          <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-blue-500 text-[10px] tracking-[0.4em] uppercase font-bold mb-1">ID: {user.id || 'AUTH_USER'}</h2>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                Profile <span className="text-blue-500">Access</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Security Level</p>
              <p className="text-lg font-mono font-bold text-blue-400">{user.role?.toUpperCase()}</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">           
            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-[#0a0f1e] px-2 text-[9px] uppercase tracking-[0.3em] text-blue-400/80 z-10">
                Nome do Operador
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border border-white/10 p-4 rounded-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all duration-300 font-medium tracking-wide"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    placeholder="NOVA SENHA"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-blue-500 outline-none transition-all text-xs tracking-[0.2em]"
                  />
                </div>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="CONFIRMAR"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-blue-500 outline-none transition-all text-xs tracking-[0.2em]"
                  />
                </div>
              </div>

              {formData.password && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      passwordStrength < 40 ? 'bg-red-500 shadow-[0_0_10px_red]' : 
                      passwordStrength < 70 ? 'bg-yellow-500 shadow-[0_0_10px_yellow]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              )}
            </div>

            {status.message && (
              <div className={`p-3 text-[10px] font-mono tracking-tighter border-l-2 ${
                status.type === "success" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-red-500/10 border-red-500 text-red-400"
              }`}>
                {">"} {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-blue-600 transition-transform duration-300 ${loading ? 'translate-y-0' : 'translate-y-[102%]'}`}></div>
              <div className="relative border border-blue-500 py-4 font-black uppercase tracking-[0.5em] text-xs transition-colors group-hover:text-white">
                {loading ? "PROCESSANDO..." : "Sincronizar Dados"}
              </div>
            </button>
          </form>

          <footer className="mt-10 flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-blue-400 transition"
            >
              VOLTAR
            </button>
            <div className="flex gap-2">
              <div className="w-1 h-1 bg-blue-500 animate-pulse"></div>
              <div className="w-1 h-1 bg-blue-500 animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-blue-500 animate-pulse delay-150"></div>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}