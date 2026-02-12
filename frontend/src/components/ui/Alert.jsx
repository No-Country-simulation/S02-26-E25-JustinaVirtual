// src/components/ui/Alert.jsx
export default function Alert({
  variant = 'info', // info | success | warning | danger
  title,
  children,
  className = '',
  ...props
}) {
  const variants = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: 'i'
    },
    success: {
      bg: 'bg-correct/10 border-correct/30',
      text: 'text-correct',
      icon: '✓'
    },
    warning: {
      bg: 'bg-warning/10 border-warning/30',
      text: 'text-warning',
      icon: '⚠'
    },
    danger: {
      bg: 'bg-danger/10 border-danger/30',
      text: 'text-danger',
      icon: '!'
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`
        flex items-start gap-3 rounded-lg border p-4
        ${style.bg} border-${style.border}
        ${className}
      `}
      {...props}
    >
      <div className={`text-xl font-bold ${style.text}`}>
        {style.icon}
      </div>
      <div className="flex-1">
        {title && <h5 className={`font-medium ${style.text}`}>{title}</h5>}
        <div className="text-sm text-muted-foreground mt-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

// Example usage:
// <Alert variant="success">Resposta correta! Muito bem.</Alert>
// <Alert variant="danger" title="Erro">Tempo esgotado. Tente novamente.</Alert>