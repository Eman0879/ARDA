// app/(auth)/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import LoginImageSection from './components/LoginImageSection';
import LoginFormSection from './components/LoginFormSection';

export default function LoginPage() {
  // Force dark theme styling on login page without affecting user preference
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('dark');
    html.classList.remove('light');
    html.setAttribute('data-theme', 'dark');
    
    // Cleanup: don't remove classes on unmount as ThemeProvider will handle it
  }, []);

  // Use dark theme colors directly
  const darkColors = {
    background: 'from-[#1A1A2E] via-[#16213E] to-[#1A1A2E]',
    paperTexture: 'bg-[url("/paper-texture-dark.svg")]',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkColors.background} relative overflow-hidden`}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#0000FF]/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#87CEEB]/8 rounded-full blur-[100px]"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="w-full h-full bg-[linear-gradient(rgba(135,206,235,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(135,206,235,0.5)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-2 lg:p-4">
        <div className="w-full max-w-[1200px]">
          {/* Main unified container */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-0 items-center">
            
            {/* Left Side - Image Section */}
            <LoginImageSection />

            {/* Right Side - Login Form */}
            <LoginFormSection />

          </div>
        </div>
      </div>
    </div>
  );
}