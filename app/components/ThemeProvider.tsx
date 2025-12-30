// app/components/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme on mount
  useEffect(() => {
    setMounted(true);
    
    const loadTheme = async () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // Fetch theme preference from API
          const response = await fetch(`/api/user/theme?username=${encodeURIComponent(user.username)}`);
          
          if (response.ok) {
            const data = await response.json();
            const savedTheme = data.theme || 'dark';
            setThemeState(savedTheme);
            applyTheme(savedTheme);
          } else {
            // Fallback to dark theme
            setThemeState('dark');
            applyTheme('dark');
          }
        } catch (error) {
          console.error('Error loading theme:', error);
          setThemeState('dark');
          applyTheme('dark');
        }
      } else {
        // No user logged in, use dark theme
        setThemeState('dark');
        applyTheme('dark');
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Save to database
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        await fetch('/api/user/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            theme: newTheme
          })
        });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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