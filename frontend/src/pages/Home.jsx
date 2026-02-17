import Navbar from "../components/Navbar";
import MainSection from "../components/MainSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      {/* Centralizando a mensagem */}
      <div className="flex justify-center mt-10 -mb-10">
        <p className="text-[10px] font-mono text-blue-500 animate-pulse tracking-[0.5em]">
           ⚠️ APENAS UM E-LEARNING // PROTOCOLO EXPERIMENTAL
        </p>
      </div>

      <MainSection />
      <Footer />
    </div>
  );
}