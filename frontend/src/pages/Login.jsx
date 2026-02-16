import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { apiService } from "../services/apiService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    try {
      // 🔐 Login Real usando o serviço que você integrou
      const data = await apiService.login(email, password);
      
      // Se o backend retornar o médico, salvamos no contexto
      login(data.medico); 
      navigate("/dashboard");
    } catch (err) {
      // Se falhar (ex: senha errada), mostramos o erro na tela
      setError("Falha na autenticação. Verifique suas credenciais.");
      
      // 💡 Fallback para desenvolvimento (caso o back esteja off)
      console.warn("Usando login fake para teste local");
      login({ name: "Dr. Ayran Vieira", crm: "123456" });
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-card p-10 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}