import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";

// Importações das Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import Simulator from "./pages/Simulator";
import Library from "./pages/Library";
import PreTestSurvey from "./pages/PreTestSurvey"; 

export default function App() {
  return (
    <TrainingSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* ✅ PASSO 2:  Rota do questionário  */}
          <Route path="/survey" element={<PreTestSurvey />} /> 
          
          <Route path="/training" element={<TrainingSessionPage />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/library" element={<Library />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TrainingSessionProvider>
  );
}