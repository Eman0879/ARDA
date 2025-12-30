// app/(auth)/login/components/LoginImageSection.tsx
'use client';

import React, { useState } from 'react';
import { useTheme, useCardCharacter } from '@/app/context/ThemeContext';

export default function LoginImageSection() {
  const { colors } = useTheme();
  const authoritativeChar = useCardCharacter('authoritative');
  const [imageError, setImageError] = useState(false);

  return (
    <div className="hidden lg:flex items-center justify-center p-6 lg:p-10">
      <div className="relative w-full max-w-xl group">
        {!imageError ? (
          <div className="relative">
            {/* Glow effect on hover */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0000FF]/40 via-[#87CEEB]/30 to-[#0000FF]/40 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            
            {/* Image container */}
            <div className={`relative rounded-xl overflow-hidden border-2 ${authoritativeChar.border} hover:border-[#87CEEB]/40 transition-all duration-500 shadow-2xl`}>
              <img
                src="/loginPepsi.jpg"
                alt="ARDA Employee Central Hub"
                className="w-full h-auto object-contain transition-all duration-700 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0000FF]/30 rounded-full blur-2xl"></div>
              <div className={`relative bg-gradient-to-br from-[#0000FF] to-[#000080] rounded-xl p-8 border ${authoritativeChar.border}`}>
                <div className="text-4xl font-black text-white">PEPSI</div>
              </div>
            </div>
            <div className={`${colors.textPrimary} text-lg font-bold text-center`}>
              Welcome to ARDA
            </div>
            <div className={`${colors.textSecondary} text-sm text-center`}>
              Employee Central Hub
            </div>
          </div>
        )}
      </div>
    </div>
  );
}