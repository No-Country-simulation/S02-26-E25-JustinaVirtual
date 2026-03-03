import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import QualityIndicator from "./QualityIndicator";

/**
 * HUD de feedback em tempo real durante a simulação
 * Mostra predições da IA enquanto o usuário está treinando
 */
export default function RealtimeFeedbackHUD({ sessionId, isActive = true, updateInterval = 5000 }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || !isActive) {
      setPrediction(null);
      return;
    }

    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getPrediction(sessionId);
        setPrediction(data);
      } catch (err) {
        setError("Erro ao obter feedback");
        console.error("Erro ao buscar predição:", err);
      } finally {
        setLoading(false);
      }
    };

    // Primeira chamada imediata
    fetchPrediction();

    // Atualização periódica
    const interval = setInterval(fetchPrediction, updateInterval);

    return () => clearInterval(interval);
  }, [sessionId, isActive, updateInterval]);

  if (!sessionId || !isActive) return null;

  return (
    <div className="fixed top-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 w-80 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <h3 className="text-sm font-semibold">🤖 Feedback IA em Tempo Real</h3>
        </div>
      </div>

      {/* Loading State */}
      {loading && !prediction && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-xs text-muted mt-2">Analisando...</p>
        </div>
      )}

      {/* Error State */}
      {error && !prediction && (
        <div className="text-center py-4">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Prediction Display */}
      {prediction && (
        <div className="space-y-3">
          {/* Quality Level */}
          {prediction.quality_level && (
            <div>
              <div className="text-xs text-muted mb-1">Qualidade</div>
              <div className="font-semibold text-lg flex items-center gap-2">
                {prediction.quality_level === "excelente" && "Excelente"}
                {prediction.quality_level === "bom" && "Bom"}
                {prediction.quality_level === "regular" && "Regular"}
                {prediction.quality_level === "precisa_melhorar" && "Precisa Melhorar"}
              </div>
              <QualityIndicator 
                qualityLevel={prediction.quality_level}
                score={prediction.smoothness_score}
                size="sm"
              />
            </div>
          )}

          {/* Interpretation */}
          {prediction.interpretation && (
            <div className="bg-background p-2 rounded text-xs">
              {prediction.interpretation}
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {prediction.num_points !== undefined && (
              <div className="bg-background p-2 rounded">
                <div className="text-muted">Pontos</div>
                <div className="font-semibold">{prediction.num_points}</div>
              </div>
            )}
            {prediction.model_confidence !== undefined && (
              <div className="bg-background p-2 rounded">
                <div className="text-muted">Confiança</div>
                <div className="font-semibold">{(prediction.model_confidence * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>

          {/* Smoothness Score Details */}
          {prediction.smoothness_score !== undefined && (
            <div className="text-xs text-muted pt-2 border-t">
              Score: <span className="font-mono">{prediction.smoothness_score.toFixed(6)}</span>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-3 pt-2 border-t text-xs text-muted">
        Atualiza a cada {updateInterval / 1000}s
      </div>
    </div>
  );
}
