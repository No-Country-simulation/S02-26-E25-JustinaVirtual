import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Simulator from "./pages/Simulator";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";

export default function App() {
  return (
    <BrowserRouter>
        <TrainingSessionProvider >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/trainingSession" element={<TrainingSessionPage />} />

      </Routes>
        </TrainingSessionProvider>
    </BrowserRouter>
  );
}
