import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Simulator from "./pages/Simulator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raiz do site: O Cadastro do Médico */}
        <Route path="/" element={<Home />} />
        
        {/* Área Protegida: O Simulador Cirúrgico */}
        <Route path="/simulator" element={<Simulator />} />
        
        {/* Rota de escape: Se digitar qualquer coisa errada, volta pra Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}