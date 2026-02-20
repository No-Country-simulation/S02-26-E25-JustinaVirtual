// src/components/ui/Card.jsx
export default function Card({
  children,
  title,
  description,
  className = "",
  ...props
}) {
  return (
    <div
      className={`
        rounded-xl border shadow-sm
        bg-white border-gray-200
        dark:bg-gray-900 dark:border-gray-700 dark:shadow-gray-950/50
        ${className}
      `}
      {...props}
    >
      {(title || description) && (
        <div className="p-6 pb-2">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
          {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}

// Example usage:
/*
<Card title="Resultado da Sessão" description="Anatomia Renal Básica">
  <p className="text-2xl font-bold text-correct">92%</p>
  <p className="text-sm text-muted">Tempo: 14 min</p>
</Card>
*/