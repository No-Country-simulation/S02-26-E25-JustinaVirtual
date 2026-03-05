import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {        
      const data = await apiService.loginUser({ email, password });      
      
      localStorage.setItem('token', data.token);    
      localStorage.setItem('justina_user', JSON.stringify(data));

      login(data); 
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
    // 🔐 Simulação de login
    const medicoFake = {
      name: "Dr. Ayran Vieira",
      crm: "CRM 123456",
      specialty: "Cirurgia Geral",
    };

    login(medicoFake);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Justina <span className="text-blue-500 font-extralight italic">Virtual</span>
          </h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold">
            Acesso ao Protocolo
          </p>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-xs p-3 rounded-xl mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              placeholder="usuario@instituicao.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest ml-1">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <button 
            onClick={() => navigate("/register")}
            className="text-slate-500 text-xs hover:text-blue-400 transition-colors"
          >
            Não possui credenciais? <span className="text-blue-500 underline">Registrar</span>
          </button>
        </footer>
      </div>
    </div>
  );
}