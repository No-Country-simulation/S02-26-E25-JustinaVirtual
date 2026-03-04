import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import Button from "../components/ui/Button";
import AIFeedbackCard from "../components/AIFeedbackCard";
import QualityIndicator from "../components/QualityIndicator";
import SessionDetailModal from "../components/SessionDetailModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [previousResults, setPreviousResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    async function loadUserSessions() {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Busca sessões da IA (3D e 2D)
        const aiSessions = await apiService.getUserSessions(user.email);
        
        // Busca histórico local (sessões antigas)
        const localHistory = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");
        
        // Combina resultados
        const aiResults = aiSessions.sessions || [];
        const combined = [...aiResults, ...localHistory];
        
        // Remove duplicatas por session_id
        const unique = combined.reduce((acc, item) => {
          if (!acc.find(x => x.session_id === item.session_id || x.id === item.id)) {
            acc.push(item);
          }
          return acc;
        }, []);
        
        // Ordena por data (mais recente primeiro)
        unique.sort((a, b) => {
          const dateA = a.date || a.timestamp || "";
          const dateB = b.date || b.timestamp || "";
          return dateB.localeCompare(dateA);
        });
        
        setPreviousResults(unique);
      } catch (error) {
        console.error("Erro ao carregar sessões:", error);
        // Fallback para dados locais
        const localHistory = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");
        setPreviousResults(localHistory);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserSessions();
  }, [user]);

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Previous Results</h2>
            {!loading && previousResults.length > 0 && (
              <span className="text-sm text-muted">
                {previousResults.length} session{previousResults.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted mt-2">Loading sessions...</p>
            </div>
          ) : previousResults.length === 0 ? (
            <p className="text-muted">No previous results found.</p>
          ) : (
            <div className="space-y-4">
              {previousResults.map((result, index) => {
                const isAI = result.session_id && result.ai_prediction;
                const is3D = result.mode === "3D Surgery" || result.procedure_type?.includes("3d");
                
                return (
                  <div
                    key={result.session_id || result.id || index}
                    className={`border p-4 rounded-lg transition-all hover:shadow-lg cursor-pointer ${
                      is3D
                        ? "border-green-500/30 bg-green-50/5 hover:border-green-500/50"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedSession(result)}
                  >
                    {/* Header da Sessão */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{result.mode || result.procedure_type || "Unknown"}</p>
                          {isAI && (
                            <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                              AI Analysis
                            </span>
                          )}
                          {is3D && (
                            <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                              3D
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted">{result.date || "N/A"}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{result.score}</p>
                        <p
                          className={`text-sm ${
                            result.status?.includes("Good") || result.status?.includes("Skill Level")
                              ? "text-green-600 dark:text-green-400"
                              : result.status?.includes("Needs") || result.status?.includes("Check")
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {result.status}
                        </p>
                      </div>
                    </div>

                    {/* Feedback da IA - Visual Destacado */}
                    {result?.ai_prediction && AIFeedbackCard && (
                      <div className="mb-3">
                        <AIFeedbackCard 
                          prediction={result.ai_prediction} 
                          metrics={result.metrics}
                        />
                      </div>
                    )}

                    {/* Indicador de Qualidade */}
                    {result?.ai_prediction?.quality_level && QualityIndicator && (
                      <div className="mb-3">
                        <QualityIndicator 
                          qualityLevel={result.ai_prediction.quality_level}
                          score={result.ai_prediction.smoothness_score}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Métricas (se não houver predição da IA) */}
                    {result.metrics && !result.ai_prediction && (
                      <div className="mt-2 flex gap-3 text-xs text-muted">
                        <span title="Economy of Motion">
                          {result.metrics.economy_of_motion}
                        </span>
                        <span title="Smoothness Score">
                          {result.metrics.smoothness_score}
                        </span>
                        <span title="Average Velocity">
                          {result.metrics.avg_velocity}
                        </span>
                      </div>
                    )}

                    {/* Indicador de clique */}
                    <div className="mt-3 pt-3 border-t text-xs text-muted flex items-center justify-end gap-1">
                      <span>Clique para ver detalhes</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Modal de Detalhes */}
      {selectedSession && SessionDetailModal && (
        <SessionDetailModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}