import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

function getActiveUserThemeKey() {
  try {
    const savedWaiter = sessionStorage.getItem('loggedInWaiter') || localStorage.getItem('loggedInWaiter');
    if (savedWaiter) {
      const waiter = JSON.parse(savedWaiter);
      if (waiter?.id) {
        return `theme_user_c${waiter.company_id || '1'}_u${waiter.id}`;
      }
    }
    const savedCompany = localStorage.getItem('active_company');
    if (savedCompany) {
      const comp = JSON.parse(savedCompany);
      if (comp?.id) {
        return `theme_company_c${comp.id}`;
      }
    }
  } catch (e) {
    // fallback
  }
  return 'theme_guest';
}

export function ThemeProvider({ children }) {
  const [activeKey, setActiveKey] = useState(getActiveUserThemeKey());
  const [theme, setThemeState] = useState(() => {
    const key = getActiveUserThemeKey();
    return localStorage.getItem(key) || 'light';
  });

  // Sync theme whenever active user changes
  const syncUserTheme = useCallback(() => {
    const newKey = getActiveUserThemeKey();
    const storedTheme = localStorage.getItem(newKey) || 'light';
    setActiveKey(newKey);
    setThemeState(storedTheme);
  }, []);

  // Poll for active user login/logout changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newKey = getActiveUserThemeKey();
      if (newKey !== activeKey) {
        syncUserTheme();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [activeKey, syncUserTheme]);

  // Apply class to <html> element and save to user-specific key
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (activeKey) {
      localStorage.setItem(activeKey, theme);
    }
  }, [theme, activeKey]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    if (activeKey) {
      localStorage.setItem(activeKey, nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, syncUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
