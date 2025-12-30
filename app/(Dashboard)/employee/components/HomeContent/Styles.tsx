// app/(Dashboard)/employee/components/HomeContent/Styles.tsx
'use client';

import React from 'react';

export default function Styles() {
  return (
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 128, 0.1);
        border-radius: 7px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #0000FF, #6495ED);
        border-radius: 7px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #6495ED, #0000FF);
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