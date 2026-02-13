export default function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 focus:ring-gray-400",
    ghost:
      "hover:bg-gray-100 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
  };

  const sizeStyles = {
    sm: "h-9 px-4 text-sm",
    default: "h-10 px-6",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button
      className={`${base} ${variantStyles[variant] || variantStyles.primary} ${
        sizeStyles[size] || sizeStyles.default
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
