import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <TrainingSessionProvider>
        <App />
      </TrainingSessionProvider>
    </AuthProvider>
  </React.StrictMode>
);