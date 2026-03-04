import React from "react";

/**
 * Componente para exibir feedback detalhado da IA no Dashboard
 */
export default function AIFeedbackCard({ prediction, metrics }) {
  if (!prediction && !metrics) return null;

  // Determina a cor baseada no quality_level
  const getQualityColor = (level) => {
    const colors = {
      excelente: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      bom: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      regular: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
      precisa_melhorar: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
    };
    return colors[level] || colors.regular;
  };

  // Traduz quality_level
  const translateQuality = (level) => {
    const translations = {
      excelente: "Excelente",
      bom: "Bom",
      regular: "Regular",
      precisa_melhorar: "Precisa Melhorar"
    };
    return translations[level] || level;
  };

  const qualityLevel = prediction?.quality_level || "N/A";
  const smoothness = prediction?.smoothness_score;
  const interpretation = prediction?.interpretation || "";
  const confidence = prediction?.model_confidence;

  return (
    <div className={`border rounded-lg p-3 ${getQualityColor(qualityLevel)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Análise IA</span>
        </div>
        {confidence !== undefined && (
          <span className="text-xs opacity-75">
            Confiança: {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Quality Level */}
      <div className="mb-2">
        <span className="text-sm font-medium">Qualidade: </span>
        <span className="text-sm font-bold">{translateQuality(qualityLevel)}</span>
      </div>

      {/* Smoothness Score */}
      {smoothness !== undefined && (
        <div className="mb-2">
          <span className="text-xs opacity-75">Suavidade: </span>
          <span className="text-xs font-mono">{smoothness.toFixed(6)}</span>
        </div>
      )}

      {/* Interpretation */}
      {interpretation && (
        <div className="text-xs mt-2 pt-2 border-t opacity-90">
          {interpretation}
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="mt-3 pt-2 border-t grid grid-cols-3 gap-2 text-xs">
          {metrics.economy_of_motion && (
            <div title="Economy of Motion">
              <div className="opacity-75">Economia</div>
              <div className="font-semibold">{metrics.economy_of_motion}</div>
            </div>
          )}
          {metrics.avg_velocity && (
            <div title="Average Velocity">
              <div className="opacity-75">Velocidade</div>
              <div className="font-semibold">{metrics.avg_velocity}</div>
            </div>
          )}
          {metrics.smoothness_score && (
            <div title="Smoothness">
              <div className="opacity-75">Suavidade</div>
              <div className="font-semibold">{metrics.smoothness_score}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
