import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'campus_booking_theme';

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // ignore storage errors
  }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyThemeToDom(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

interface ThemeState {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  initTheme: () => () => void;
}

const initialPreference = getStoredPreference();
const initialResolved = resolveTheme(initialPreference);
applyThemeToDom(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialPreference,
  resolvedTheme: initialResolved,

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
    applyThemeToDom(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const next: ThemePreference = get().resolvedTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  initTheme: () => {
    const pref = getStoredPreference();
    const resolved = resolveTheme(pref);
    applyThemeToDom(resolved);
    set({ theme: pref, resolvedTheme: resolved });

    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (get().theme === 'system') {
        const nextResolved = getSystemTheme();
        applyThemeToDom(nextResolved);
        set({ resolvedTheme: nextResolved });
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  },
}));
