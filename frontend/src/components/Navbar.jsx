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
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';   // ← new imports

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav 
      className="
        w-full px-6 py-4 
        bg-surface 
        border-b border-border 
        flex justify-between items-center
        sticky top-0 z-50 backdrop-blur-sm
        transition-all duration-300
      "
    >
      <Link to="/" className="font-semibold text-lg text-foreground">
        Justina Simulator
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Theme toggle – improved with lucide icons */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-full 
            hover:bg-accent 
            transition-colors
            text-muted-foreground hover:text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/50
          "
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Auth section */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
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

        {/* Optional production tag */}
        <span className="text-xs text-muted-foreground hidden md:block">
          Produção
        </span>
      </div>
    </nav>
  );
}