// export default function Navbar() {
//   return (
//     <nav className="w-full px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
//       <span className="font-semibold text-lg">
//         Justina Simulator
//       </span>

//       <span className="text-sm text-gray-400 hidden sm:block">
//         Production
//       </span>
//     </nav>
//   );
// }

// src/components/Navbar.jsx
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import { Link } from 'react-router-dom'; // assuming you use react-router

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="
      w-full px-6 py-4 
      bg-surface 
      border-b border-border 
      flex justify-between items-center
      sticky top-0 z-50 backdrop-blur-sm
    ">
      <Link to="/" className="font-semibold text-lg text-foreground">
        Justina Simulator
      </Link>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-full 
            hover:bg-accent 
            transition-colors
            text-muted hover:text-foreground
          "
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <span className="text-xl">☀️</span> // light mode icon
          ) : (
            <span className="text-xl">🌙</span> // dark mode icon
          )}
        </button>

        {/* Auth section */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:block">
              {user.name || user.email}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="primary" size="sm">
              Login
            </Button>
          </Link>
        )}

        {/* Optional: small production tag */}
        <span className="text-xs text-muted-foreground hidden md:block">
          Produção
        </span>
      </div>
    </nav>
  );
}