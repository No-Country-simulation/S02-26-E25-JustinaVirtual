// src/components/ui/ScoreDisplay.jsx
export default function ScoreDisplay({ current, max }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

  return (
    <div>
      <div className="text-sm opacity-80">Pontuação</div>
      <div className="text-xl font-bold">
        {current} / {max} <span className="text-lg">({percentage}%)</span>
      </div>
    </div>
  );
}