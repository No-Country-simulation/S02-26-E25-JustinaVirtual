import { Link } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";
import { useState, useEffect } from "react";
import Button from "./ui/Button";

export default function MainSection() {
  // Estado para saber se o usuário está registrado
  const [isRegistered, setIsRegistered] = useState(false);

  // Verificação se já existe alguém no localStorage ao carregar a página
  useEffect(() => {
    const user = localStorage.getItem("justina_user");
    if (user) {
      setIsRegistered(true);
    }
  }, []);

  return (
    <section className="flex-1 px-6 py-16 bg-color-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado esquerdo – Registro */}
        <div className="bg-color-background p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">
            User Registration
          </h2>
          {/* Passando uma função para o formulário avisar quando terminar */}
          <RegistrationForm onRegisterSuccess={() => setIsRegistered(true)} />

          <p className="text-sm text-gray-600 mt-6 text-center">
            Já é cadastrado?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        {/* Lado direito – Start */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold mb-6">
            Start the Simulation
          </h2>

          <p className="text-gray-600 mb-8">
            Begin your surgical training with real-time performance tracking.
          </p>

          {/* Lógica de liberação do botão: Verde se registrado, Cinza se bloqueado */}
          {isRegistered ? (
            <Link
              to="/simulator"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-md text-lg transition shadow-lg"
            >
              Start Simulator Now →
            </Link>
          ) : (
            <button
              disabled
              className="inline-block bg-gray-400 text-white px-8 py-4 rounded-md text-lg cursor-not-allowed"
            >
              Register to Unlock Simulator
            </button>
            
          )}
        </div>

      </div>
    </section>
  );
}