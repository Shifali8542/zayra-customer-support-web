import React, {
  createContext, useContext, useEffect,
  useState, useCallback, ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('zayra-theme') as Theme) ?? 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('zayra-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
