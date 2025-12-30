// app/(Dashboard)/dept-head/components/HomeContent/Styles.tsx
'use client';

import React from 'react';

export default function Styles() {
  return (
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--scrollbar-track);
        border-radius: 7px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 7px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover);
      }

      .announcement-card {
        transition: box-shadow 0.3s ease;
      }

      .announcement-card:hover {
        box-shadow: inset 0 0 18px -3px var(--glow-color);
      }

      @keyframes urgent-pulse {
        0%, 100% {
          box-shadow: inset 0 0 14px -2px var(--glow-color);
        }
        50% {
          box-shadow: inset 0 0 28px 0px var(--glow-color);
        }
      }

      .urgent-glow {
        animation: urgent-pulse 2s ease-in-out infinite;
      }
    `}</style>
  );
}