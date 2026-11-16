import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
      title={isDark ? 'Mod luminos' : 'Mod întunecat'}
      className={`inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-medium cursor-pointer ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">Luminos</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-600" />
          <span className="hidden lg:inline">Întunecat</span>
        </>
      )}
    </button>
  );
}
