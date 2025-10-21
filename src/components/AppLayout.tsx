import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Users, Calendar, TrendingUp, User, CreditCard } from 'lucide-react';
import ChatWidget from './ChatWidget';
import ThemeToggle from './ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Inicio', path: '/dashboard' },
  { icon: Dumbbell, label: 'Rutinas', path: '/rutinas' },
  { icon: Utensils, label: 'Dietas', path: '/dietas' },
  { icon: Users, label: 'Social', path: '/social' },
  { icon: Calendar, label: 'Calendario', path: '/calendario' },
  { icon: TrendingUp, label: 'Progreso', path: '/progreso' },
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: CreditCard, label: 'Planes', path: '/planes' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 gradient-mesh">
      {/* Top Navigation */}
      <nav className="glass-card border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-emerald-500" />
              <span className="text-slate-900 dark:text-white">GymPal</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
