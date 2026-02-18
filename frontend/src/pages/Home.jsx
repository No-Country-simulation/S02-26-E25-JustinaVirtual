import Navbar from "../components/Navbar";
import MainSection from "../components/MainSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      {/* O BLOCO DE MENSAGEM FOI REMOVIDO DAQUI 
          PARA MANTER A TELA DE CADASTRO LIMPA.
      */}

      <MainSection />
      <Footer />
    </div>
  );
}