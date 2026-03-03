import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const navLink = (to: string, label: string) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={
          isActive
            ? 'text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground transition-colors'
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/workflows" className="text-2xl font-bold text-foreground">
            Orchestrator
          </Link>
          <nav className="flex items-center gap-4">
            {navLink('/workflows', 'Workflows')}
            {navLink('/executions', 'Executions')}
            {navLink('/hitl', 'HITL Requests')}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <button
            onClick={toggle}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
