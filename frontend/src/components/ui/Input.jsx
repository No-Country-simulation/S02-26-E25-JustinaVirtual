// src/components/ui/Input.jsx
export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      
      <input
        className={`
          flex h-10 w-full rounded-md border border-border 
          bg-input px-3 py-2 text-sm text-foreground
          placeholder:text-muted-foreground
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-danger focus:ring-danger/20' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-danger mt-1">{error}</p>
      )}
    </div>
  );
}

// Example usage:
// <Input label="Email" type="email" placeholder="seu@email.com" />
// <Input label="Senha" type="password" error="Senha incorreta" />