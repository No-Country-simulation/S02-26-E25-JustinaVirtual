//-------------- version 4  ------------------
// src/components/ui/Input.jsx
export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full px-4 py-3 rounded-lg border text-base
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          border-gray-300 dark:border-gray-700
          focus:border-blue-500 dark:focus:border-blue-400
          focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/40
          disabled:cursor-not-allowed disabled:opacity-60
          disabled:bg-gray-100 dark:disabled:bg-gray-950
          transition-all duration-150
          ${error
            ? 'border-red-500 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/40'
            : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}