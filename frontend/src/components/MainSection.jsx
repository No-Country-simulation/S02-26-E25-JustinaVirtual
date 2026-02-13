import { Link } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";
import Button from "./ui/Button";

export default function MainSection() {
  return (
    <section className="flex-1 px-6 py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado esquerdo – Registro */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">
            User Registration
          </h2>

          <RegistrationForm />

          <p className="text-sm text-gray-600 mt-6 text-center">
            Já é cadastrado?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        {/* Lado direito – Start */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Start the Simulation
          </h2>

          <p className="text-gray-600 mb-8">
            Begin your surgical training with real-time performance tracking.
          </p>

          <Link to="/login">
            <Button>
              Start Simulation
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
