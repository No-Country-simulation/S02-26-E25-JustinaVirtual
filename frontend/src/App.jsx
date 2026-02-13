import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import Simulator from "./pages/Simulator";
import Library from "./pages/Library";

import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <TrainingSessionProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/treinamento" element={<TrainingSessionPage />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/library" element={<Library />} />
          </Route>

        </Routes>
      </TrainingSessionProvider>
    </BrowserRouter>
  );
}
