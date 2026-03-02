import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [previousResults, setPreviousResults] = useState([
    { id: 1, date: "2026-02-01", mode: "Training", score: "85%", status: "Approved" },
    { id: 2, date: "2026-01-28", mode: "Simulator", score: "72%", status: "Needs Improvement" },
  ]);

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");

    setPreviousResults(prev => {
      const idsFixos = [1, 2];
      const novosFiltrados = salvos.filter(s => !idsFixos.includes(s.id));
      return [...novosFiltrados, ...prev];
    });
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!user) return <div className="p-10 text-center">Access denied.</div>;

  return (
    <div className="min-h-screen bg-color-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-card p-6 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted">{user.crm} - {user.specialty}</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Training */}
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold">Training Mode</h2>
              <p className="text-sm text-muted">
                Practice guided procedures and improve technique.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full mt-4"
              onClick={() => navigate("/treinamento")}
            >
              Start Training
            </Button>
          </div>

          {/* Simulator */}
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold">Simulator Mode</h2>
              <p className="text-sm text-muted">
                Simulate real-case scenarios under evaluation.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="w-full mt-4"
              onClick={() => navigate("/simulator")}
            >
              Start Simulation
            </Button>
          </div>

          {/* 3D */}
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col justify-between border-2 border-primary/20">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                3D Surgery Mode
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  New
                </span>
              </h2>
              <p className="text-sm text-muted">
                Advanced 3D renal surgery simulation.
              </p>
            </div>
            <Button
              variant="success"
              size="lg"
              className="w-full mt-4 font-bold"
              onClick={() => navigate("/simulador-3d")}
            >
              Enter 3D Simulation
            </Button>
          </div>

        </div>

        {/* PREVIOUS RESULTS */}
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Previous Results</h2>

          {previousResults.length === 0 ? (
            <p className="text-muted">No previous results found.</p>
          ) : (
            <div className="space-y-4">
              {previousResults.map((result) => (
                <div
                  key={result.id}
                  className={`flex justify-between items-center border p-4 rounded-lg ${
                    result.mode === "3D Surgery"
                      ? "border-green-500/30 bg-green-50/5"
                      : "border-border"
                  }`}
                >
                  <div>
                    <p className="font-medium">{result.mode}</p>
                    <p className="text-sm text-muted">{result.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{result.score}</p>
                    <p
                      className={`text-sm ${
                        result.status === "Approved" ||
                        result.status === "Session Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {result.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}