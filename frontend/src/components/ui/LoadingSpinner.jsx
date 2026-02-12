// src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 'default', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        animate-spin rounded-full border-4 border-primary border-t-transparent
        ${sizes[size]}
      `} />
    </div>
  );
}

// Example:
// {isLoading && <LoadingSpinner />}