// // src/components/ui/Input.jsx
// export default function Input({
//   label,
//   error,
//   className = '',
//   ...props
// }) {
//   return (
//     <div className="space-y-1.5">
//       {label && (
//         <label className="text-sm font-medium text-muted">
//           {label}
//         </label>
//       )}
      
//       <input
//         className={`
//           flex h-10 w-full rounded-md border border-border 
//           bg-input px-3 py-2 text-sm text-foreground
//           placeholder:text-muted-foreground
//           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
//           disabled:cursor-not-allowed disabled:opacity-50
//           ${error ? 'border-danger focus:ring-danger/20' : ''}
//           ${className}
//         `}
//         {...props}
//       />
      
//       {error && (
//         <p className="text-sm text-danger mt-1">{error}</p>
//       )}
//     </div>
//   );
// }

// // Example usage:
// // <Input label="Email" type="email" placeholder="seu@email.com" />
// // <Input label="Senha" type="password" error="Senha incorreta" />

//------------ version 2 ------------------
export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        className={`
          flex h-10 w-full rounded-md border px-3 py-2 text-sm
          bg-white text-gray-900 placeholder:text-gray-400
          border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          disabled:cursor-not-allowed disabled:opacity-50
          dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500
          dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-500/30
          ${error ? 'border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-500/30' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}