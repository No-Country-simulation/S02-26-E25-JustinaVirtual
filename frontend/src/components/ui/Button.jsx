// export default function Button({
//   children,
//   variant = "primary",
//   size = "default",
//   className = "",
//   disabled = false,
//   ...props
// }) {
//   const base =
//     "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

//   const variantStyles = {
//     primary:
//       "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
//     secondary:
//       "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600",
//     outline:
//       "border border-gray-300 bg-transparent hover:bg-gray-100 focus:ring-gray-400",
//     ghost:
//       "hover:bg-gray-100 focus:ring-gray-400",
//     danger:
//       "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
//     success:
//       "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
//   };

//   const sizeStyles = {
//     sm: "h-9 px-4 text-sm",
//     default: "h-10 px-6",
//     lg: "h-12 px-8 text-lg",
//   };

//   return (
//     <button
//       className={`${base} ${variantStyles[variant] || variantStyles.primary} ${
//         sizeStyles[size] || sizeStyles.default
//       } ${className}`}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }


//------------------- version 2 --------------------
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
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 " +
      "dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400",

    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 " +
      "dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-400",

    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 focus:ring-gray-400 " +
      "dark:border-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-500",

    ghost:
      "hover:bg-gray-100 focus:ring-gray-400 " +
      "dark:hover:bg-gray-800 dark:focus:ring-gray-500",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 " +
      "dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400",

    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 " +
      "dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-400",
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