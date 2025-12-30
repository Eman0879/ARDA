// ===== app/components/universal/settingscomponents/ThemeToggle.tsx =====
'use client';

import React from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface ThemeToggleProps {
  username: string;
}

export default function ThemeToggle({ username }: ThemeToggleProps) {
  const { theme, colors, cardCharacters, toggleTheme } = useTheme();
  const charColors = cardCharacters.creative;
  
  const [saving, setSaving] = React.useState(false);

  const handleToggle = async () => {
    setSaving(true);
    toggleTheme();
    
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <Palette className={`h-5 w-5 ${charColors.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-lg font-black ${charColors.text} mb-0.5`}>Theme Preference</h3>
              <p className={`${colors.textSecondary} text-xs font-semibold`}>
                Choose your preferred color scheme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Light Mode Indicator */}
            <div className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
              theme === 'light' 
                ? `bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.text}`
                : `${colors.textMuted} opacity-50`
            }`}>
              <Sun className={`h-4 w-4 ${theme === 'light' ? 'animate-pulse' : ''}`} />
              <span className="font-bold text-xs">Light</span>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`group relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none overflow-hidden ${
                saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#000080] via-[#0000FF] to-[#6495ED]'
                  : 'bg-gradient-to-r from-[#FFA500] via-[#FFD700] to-[#FFFF00]'
              }`}></div>
              
              {/* Animated glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
                style={{ 
                  boxShadow: theme === 'dark' 
                    ? 'inset 0 0 20px rgba(100,149,237,0.5)' 
                    : 'inset 0 0 20px rgba(255,215,0,0.5)' 
                }}
              ></div>

              {/* Toggle Circle */}
              <div
                className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-[2.125rem]' : 'translate-x-0.5'
                }`}
              >
                {saving ? (
                  <div 
                    className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: theme === 'dark' ? '#0000FF' : '#FFA500' }}
                  ></div>
                ) : theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-[#0000FF]" />
                ) : (
                  <Sun className="h-4 w-4 text-[#FFA500]" />
                )}
              </div>
            </button>

            {/* Dark Mode Indicator */}
            <div className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
              theme === 'dark' 
                ? `bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.text}`
                : `${colors.textMuted} opacity-50`
            }`}>
              <Moon className={`h-4 w-4 ${theme === 'dark' ? 'animate-pulse' : ''}`} />
              <span className="font-bold text-xs">Dark</span>
            </div>
          </div>
        </div>

        {/* Subtle description */}
        <div className={`mt-4 pt-4 border-t ${charColors.border}`}>
          <p className={`text-xs ${colors.textMuted} flex items-center gap-2`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ 
              backgroundColor: theme === 'dark' ? '#6495ED' : '#FFA500' 
            }}></span>
            {theme === 'dark' 
              ? 'Dark mode is easier on the eyes in low-light environments'
              : 'Light mode provides better visibility in bright environments'}
          </p>
        </div>
      </div>
    </div>
  );
}