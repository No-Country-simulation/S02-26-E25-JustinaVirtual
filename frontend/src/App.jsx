import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import PrivateRoute from "./components/PrivateRoute";

// Importações das Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import Simulator from "./pages/Simulator";
import Library from "./pages/Library";

export default function App() {
  return (
     <BrowserRouter>
        <TrainingSessionProvider>
           <Routes>
              {/* Fluxo Principal */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
                 <Route path="/library" element={<Library />} />
              {/* Rota de Segurança */}
              <Route element={<PrivateRoute />}>
                 <Route path="/dashboard" element={<Dashboard />} />
                 <Route path="/training" element={<TrainingSessionPage />} />
                 <Route path="/simulator" element={<Simulator />} />

                 {/* Se o médico se perder, ele volta para a Home */}
                 <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
           </Routes>
        </TrainingSessionProvider>
     </BrowserRouter>
  );
}