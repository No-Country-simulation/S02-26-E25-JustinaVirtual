import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import PrivateRoute from "./components/PrivateRoute";

// Layouts
import AppLayout from "./layouts/AppLayout";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import Simulator from "./pages/Simulator"; 
import Library from "./pages/Library";
import SimuladorRenal3D from "./canvas/SimuladorRenal3D"; 

export default function App() {
  return (
    <BrowserRouter>
      <TrainingSessionProvider>
        <Routes>

          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Layout Principal com Proteção */}
          <Route element={<AppLayout />}>
            
            {/* Rota Raiz */}
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />

            {/* Todas as rotas abaixo exigem Login (PrivateRoute) */}
            <Route element={<PrivateRoute />}>
              
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Módulos de Treinamento */}
              <Route path="/treinamento" element={<TrainingSessionPage />} />
              <Route path="/training" element={<TrainingSessionPage />} />

              {/* SIMULADOR 3D */}
              <Route path="/simulador-3d" element={<SimuladorRenal3D />} />

              {/* SIMULADOR 2D*/}              
              <Route path="/simulador-2d" element={<Simulator />} />

              {/* Se o usuário digitar qualquer rota errada estando logado, volta pro Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Route>
          </Route>

        </Routes>
      </TrainingSessionProvider>
    </BrowserRouter>
  );
}