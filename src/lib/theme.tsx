'use client';
// =============================================================================
// ThemeProvider — Focus Light / Quanta Dark theme context
// Applies data-wq-theme attribute to the session wrapper div.
// Preference persisted in localStorage with key 'wq-theme'.
// =============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type WQTheme = 'focus-light' | 'quanta-dark';

interface ThemeContextValue {
  theme:     WQTheme;
  setTheme:  (t: WQTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:       'focus-light',
  setTheme:    () => {},
  toggleTheme: () => {},
});

const LS_KEY = 'wq-theme';

// The theme wrapper div is created here and shared via ref so the
// data-wq-theme attribute can be updated without re-rendering children.
export function ThemeProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [theme, setThemeState] = useState<WQTheme>('focus-light');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY) as WQTheme | null;
      if (stored === 'focus-light' || stored === 'quanta-dark') {
        setThemeState(stored);
      }
    } catch {}
  }, []);

  // Keep data-wq-theme attribute in sync
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.setAttribute('data-wq-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: WQTheme) => {
    setThemeState(t);
    try { localStorage.setItem(LS_KEY, t); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'focus-light' ? 'quanta-dark' : 'focus-light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        ref={wrapperRef}
        data-wq-theme={theme}
        className={className}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
