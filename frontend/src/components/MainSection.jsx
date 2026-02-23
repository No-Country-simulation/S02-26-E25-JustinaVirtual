import { Link } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";
import { useState, useEffect } from "react";

export default function MainSection() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("justina_user");
    if (user) {
      setIsRegistered(true);
    }
  }, []);

  return (
    // Mudança de bg-gray-100 para bg-slate-950 para combinar com o "Brilho do Everton"
    <section className="flex-1 px-6 py-16 bg-slate-950">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado esquerdo – Registro */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
          <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-tight">
            User Registration
          </h2>
          <RegistrationForm onRegisterSuccess={() => setIsRegistered(true)} />

          <p className="text-sm text-slate-500 mt-6 text-center">
            Já é cadastrado?{" "}
            <Link to="/login" className="text-blue-500 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        {/* Lado direito – Start */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight uppercase">
            Start the <br/>
            <span className="text-blue-500 text-5xl">Simulation</span>
          </h2>

          <p className="text-slate-400 mb-8 text-lg">
            Begin your surgical training with real-time performance tracking and AI feedback.
          </p>

          {isRegistered ? (
            <Link
              to="/simulator"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
            >
              Start Simulator Now →
            </Link>
          ) : (
            <div className="inline-block bg-slate-800 text-slate-500 px-10 py-5 rounded-2xl text-xl font-bold border border-slate-700 cursor-not-allowed italic">
              Register to Unlock Simulator
            </div>
          )}
        </div>

      </div>
    </section>
  );
}