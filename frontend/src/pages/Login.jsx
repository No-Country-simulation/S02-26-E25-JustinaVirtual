import { API_BASE_URL } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {  
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();
    
      localStorage.setItem('token', data.token);

      login(data); 
      
      navigate("/dashboard");

    } catch (error) {
      alert("Erro ao acessar o sistema: " + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-color-background ">
      <div className="bg-card  border border-border p-10 rounded-lg shadow-md w-full max-w-md">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" size="lg" className="w-full">
            Entrar
          </Button>

        </form>
      </div>
    </div>
  );
}