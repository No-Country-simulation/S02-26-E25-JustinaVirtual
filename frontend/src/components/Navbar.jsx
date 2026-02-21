// src/components/Navbar.jsx
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav
      className={`
        w-full px-6 py-4
        bg-surface
      //   bg-white dark:bg-gray-950
        border-b border-border
        flex justify-between items-center
        sticky top-0 left-0 right-0 z-50
        shadow-md
        transition-colors duration-200
      `}
    >
      <Link
        to="/"
        className="font-semibold text-lg text-foreground"
      >
        Justina Simulator
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Theme toggle */}
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
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="primary" size="sm">
              Entrar
            </Button>
          </Link>
        )}

        <span className="text-xs text-muted-foreground hidden md:block">
          Produção
        </span>
      </div>
    </nav>
  );
}