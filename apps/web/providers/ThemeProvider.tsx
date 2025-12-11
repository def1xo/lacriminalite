'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (enableSystem && prefersDark) {
      setTheme('dark');
    }
  }, [enableSystem]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    } else {
      root.setAttribute(attribute, theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, attribute, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  // Предотвращаем мигание при гидратации
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}