import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, UserCircle, LogOut, Terminal } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full px-8 py-3 bg-slate-950/80 backdrop-blur-2xl border-b border-blue-500/20 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">    
    
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="group relative font-black text-xl tracking-tighter text-white uppercase italic flex items-center gap-2"
        >
          <div className="w-2 h-6 bg-blue-600 skew-x-[-20deg] group-hover:scale-y-125 transition-transform"></div>
          <span>
            Justina <span className="text-blue-500 font-light not-italic">Simulator</span>
          </span>
          
          <span className="absolute -bottom-4 left-4 text-[8px] text-slate-500 font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            v2.0.4_BUILD
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
       
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-sm border border-white/5 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-slate-400 hover:text-blue-400 group"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          
          <span className="absolute top-12 right-0 bg-slate-900 border border-blue-500/30 px-2 py-1 text-[8px] text-blue-400 hidden group-hover:block whitespace-nowrap font-mono uppercase">
            Toggle_Interface
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
           
            <div className="hidden md:flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">System_Online</span>
              </div>
              <span className="text-[9px] text-blue-400/70 font-mono uppercase tracking-[0.2em]">
                {user.role || 'Guest'}
              </span>
            </div>

            {/* Avatar / Link Perfil */}
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-3 px-4 py-2 bg-blue-600/5 border border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/20 transition-all rounded-sm group"
            >
              <div className="relative">
                <UserCircle className="h-5 w-5 text-blue-400" />
                <div className="absolute -inset-1 bg-blue-500/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
                {user.name}
              </span>
            </button>

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-2.5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded-sm"
            >
              <LogOut className="h-4 w-4" />
            </button>

          </div>
        ) : (
          <Link to="/login" className="relative group">
            <div className="absolute -inset-0.5 bg-blue-600 opacity-20 group-hover:opacity-50 blur-sm transition"></div>
            <button className="relative px-6 py-2 bg-slate-900 border border-blue-500 text-blue-400 text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all">
              Initialize_Auth
            </button>
          </Link>
        )}

      </div>
    </nav>
  );
}