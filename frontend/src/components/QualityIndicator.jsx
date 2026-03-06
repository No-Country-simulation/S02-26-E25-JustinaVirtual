import React from "react";

/**
 * Indicador visual de qualidade com barra de progresso colorida
 */
export default function QualityIndicator({ qualityLevel, score, size = "md" }) {
  // Configurações de tamanho
  const sizes = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  };

  // Mapeia quality_level para porcentagem visual
  const getPercentage = (level) => {
    const map = {
      excelente: 95,
      bom: 75,
      regular: 50,
      precisa_melhorar: 25
    };
    return map[level] || 50;
  };

  // Cor baseada no nível
  const getColor = (level) => {
    const colors = {
      excelente: "bg-green-500",
      bom: "bg-blue-500",
      regular: "bg-yellow-500",
      precisa_melhorar: "bg-red-500"
    };
    return colors[level] || "bg-gray-500";
  };

  const percentage = getPercentage(qualityLevel);
  const color = getColor(qualityLevel);

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${color} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {score !== undefined && (
        <div className="text-xs text-muted mt-1 text-center">
          Score: {typeof score === 'number' ? score.toFixed(6) : score}
        </div>
      )}
    </div>
  );
}
