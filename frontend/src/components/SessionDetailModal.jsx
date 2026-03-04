import React from "react";
import Button from "./ui/Button";
import AIFeedbackCard from "./AIFeedbackCard";
import QualityIndicator from "./QualityIndicator";

/**
 * Modal para exibir detalhes completos de uma sessão
 */
export default function SessionDetailModal({ session, onClose }) {
  if (!session) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("pt-BR");
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const prediction = session.ai_prediction;
  const metrics = session.metrics;
  const is3D = session.mode === "3D Surgery" || session.procedure_type?.includes("3d");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className={`p-6 border-b ${is3D ? 'bg-green-50/10 border-green-500/20' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {session.mode || session.procedure_type || "Sessão de Treinamento"}
              </h2>
              <p className="text-sm text-muted">{formatDate(session.date || session.timestamp)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Badges */}
          <div className="flex gap-2 mt-3">
            {is3D && (
              <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                3D Surgery
              </span>
            )}
            {session.session_id && (
              <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                Análise IA
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <div className="text-sm text-muted mb-1">ID da Sessão</div>
              <div className="text-xs font-mono">{session.session_id || session.id || "N/A"}</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="text-sm text-muted mb-1">Duração</div>
              <div className="font-semibold">{formatDuration(session.duration)}</div>
            </div>
          </div>

          {/* Análise da IA */}
          {prediction && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Análise da Inteligência Artificial</h3>
              <AIFeedbackCard prediction={prediction} metrics={metrics} />
              
              {prediction.quality_level && (
                <div className="mt-4">
                  <div className="text-sm text-muted mb-2">Indicador de Qualidade</div>
                  <QualityIndicator 
                    qualityLevel={prediction.quality_level} 
                    score={prediction.smoothness_score}
                    size="lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Métricas Detalhadas */}
          {metrics && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Métricas Detalhadas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {metrics.economy_of_motion && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Economia de Movimento</div>
                    <div className="text-lg font-semibold">{metrics.economy_of_motion}</div>
                  </div>
                )}
                {metrics.smoothness_score && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Suavidade</div>
                    <div className="text-lg font-semibold">{metrics.smoothness_score}</div>
                  </div>
                )}
                {metrics.avg_velocity && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Velocidade Média</div>
                    <div className="text-lg font-semibold">{metrics.avg_velocity}</div>
                  </div>
                )}
                {metrics.tremor_detected !== undefined && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Tremor Detectado</div>
                    <div className="text-lg font-semibold">
                      {metrics.tremor_detected ? "Sim" : "Não"}
                    </div>
                  </div>
                )}
                {session.num_points && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Pontos Capturados</div>
                    <div className="text-lg font-semibold">{session.num_points}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score e Status (dados antigos) */}
          {(session.score || session.status) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Avaliação Geral</h3>
              <div className="grid grid-cols-2 gap-3">
                {session.score && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Pontuação</div>
                    <div className="text-2xl font-bold">{session.score}</div>
                  </div>
                )}
                {session.status && (
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-xs text-muted mb-1">Status</div>
                    <div className="font-semibold">{session.status}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback do Usuário */}
          {session.user_feedback && (
            <div>
              <h3 className="text-lg font-semibold mb-2">💬 Feedback do Usuário</h3>
              <div className="bg-background p-4 rounded-lg text-sm">
                {session.user_feedback}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>

      </div>
    </div>
  );
}
