// src/components/ui/Alert.jsx
export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  ...props
}) {
  const styles = {
    info: {
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50",
      text: "text-blue-800 dark:text-blue-200",
    },
    success: {
      bg: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50",
      text: "text-green-800 dark:text-green-200",
    },
    // ... add warning & danger similarly
  }[variant];

  return (
    <div
      className={`
        flex items-start gap-3 rounded-lg border p-4 ${styles.bg} ${styles.text} ${className}
      `}
      {...props}
    >
      {/* icon + content */}
      <div className="flex-1">
        {title && <h5 className="font-medium">{title}</h5>}
        <div className="text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
}

// Example usage:
// <Alert variant="success">Resposta correta! Muito bem.</Alert>
// <Alert variant="danger" title="Erro">Tempo esgotado. Tente novamente.</Alert>