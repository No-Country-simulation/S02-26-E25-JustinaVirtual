// src/components/ui/Button.jsx
export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger | success
  size = 'default',    // sm | default | lg
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-md font-medium 
    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:pointer-events-none
  `;

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
    outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-accent',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-accent',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
    success: 'bg-correct text-white hover:bg-correct/90 focus:ring-correct',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    default: 'h-10 px-6 py-2',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Example usage:
// <Button>Entrar</Button>
// <Button variant="outline">Cancelar</Button>
// <Button variant="success" size="lg">Concluído!</Button>