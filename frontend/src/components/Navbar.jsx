export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
      <span className="font-semibold text-lg">
        Justina Simulator
      </span>

      <span className="text-sm text-gray-400 hidden sm:block">
        Production
      </span>
    </nav>
  );
}
