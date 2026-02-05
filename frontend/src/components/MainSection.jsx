import { Link } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";

export default function MainSection() {
  return (
    <section className="flex-1 px-6 py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado esquerdo – Formulário */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">
            User Registration
          </h2>
          <RegistrationForm />
        </div>

        {/* Lado direito – CTA */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start the Simulation
          </h2>

          <p className="text-gray-600 mb-8">
            Access the interactive surgical simulator and begin training
            with real-time performance tracking.
          </p>

          <Link
            to="/simulator"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition"
          >
            Go to Simulator
          </Link>
        </div>

      </div>
    </section>
  );
}
