/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,cjs,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic colors using your CSS variables
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        surface:    'hsl(var(--surface))',
        border:     'hsl(var(--border))',
        // Add more as needed (muted, primary, accent, etc.)
        muted:      'hsl(240 5% 64.9%)',          // example fallback
        'muted-foreground': 'hsl(240 3.8% 45%)',
        primary:    'hsl(221 83% 53%)',           // blue example
        accent:     'hsl(240 4.8% 95.9%)',
      },
    },
  },
  plugins: [],
};