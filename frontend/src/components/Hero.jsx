import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="px-6 py-20 text-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Justina
      </h1>

      <p className="text-gray-600 max-w-xl mx-auto mb-8">
        Training and simulation platform for minimally invasive renal surgery.
      </p>

      <Link
        to="/simulator"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
      >
        Go to Simulator
      </Link>
    </section>
  );
}
