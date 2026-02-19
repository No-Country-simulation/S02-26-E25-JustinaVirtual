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
import SimuladorRenal3D from "./canvas/SimualdorRenal3D";

export default function App() {
  return (
    <BrowserRouter>
      <TrainingSessionProvider>
        <Routes>

          {/* Login fora do layout */}
          <Route path="/login" element={<Login />} />

          {/* Layout principal */}
          <Route element={<AppLayout />}>

            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />

            {/* Rotas protegidas */}
            <Route element={<PrivateRoute />}>

              <Route path="/dashboard" element={<Dashboard />} />

              {/* Mantendo as duas versões */}
              <Route path="/training" element={<TrainingSessionPage />} />
              <Route path="/treinamento" element={<TrainingSessionPage />} />

              <Route path="/simulator" element={<Simulator />} />
              <Route path="/simulador-3d" element={<SimuladorRenal3D />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Route>
          </Route>

        </Routes>
      </TrainingSessionProvider>
    </BrowserRouter>
  );
}