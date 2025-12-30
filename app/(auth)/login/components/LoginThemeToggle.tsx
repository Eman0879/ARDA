// app/(auth)/login/components/LoginThemeToggle.tsx
'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function LoginThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = React.useState(false);

  const handleToggle = async () => {
    setSaving(true);
    toggleTheme();
    
    // Save to localStorage for persistence before login
    localStorage.setItem('preferredTheme', theme === 'dark' ? 'light' : 'dark');
    
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleToggle}
        disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0000FF]/30 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-[#000080] to-[#0000FF]'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-105'}`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {saving ? (
            <div className="w-2.5 h-2.5 border-2 border-[#0000FF] border-t-transparent rounded-full animate-spin"></div>
          ) : theme === 'dark' ? (
            <Moon className="h-2.5 w-2.5 text-[#0000FF]" />
          ) : (
            <Sun className="h-2.5 w-2.5 text-yellow-500" />
          )}
        </div>
      </button>
    </div>
  );
}