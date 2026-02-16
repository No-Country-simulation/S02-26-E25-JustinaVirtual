import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
// 1. Importe o Provider 
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {/* 2. Envolva a aplicação com o TrainingSessionProvider */}
      <TrainingSessionProvider>
        <App />
      </TrainingSessionProvider>
    </AuthProvider>
  </React.StrictMode>
);