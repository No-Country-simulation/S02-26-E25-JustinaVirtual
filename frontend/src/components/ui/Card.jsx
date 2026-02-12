// src/components/ui/Card.jsx
export default function Card({
  children,
  title,
  description,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-surface rounded-xl border border-border shadow-sm
        ${className}
      `}
      {...props}
    >
      {(title || description) && (
        <div className="p-6 pb-2">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
      )}
      
      <div className="p-6 pt-0">
        {children}
      </div>
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