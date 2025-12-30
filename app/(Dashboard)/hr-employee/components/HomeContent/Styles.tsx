// app/(Dashboard)/hr-employee/components/HomeContent/Styles.tsx
'use client';

import React from 'react';

export default function Styles() {
  return (
    <style jsx global>{`
      @keyframes urgent-glow {
        0%, 100% {
          box-shadow: 0 0 14px rgba(255, 0, 0, 0.5), inset 0 0 14px rgba(255, 0, 0, 0.1);
        }
        50% {
          box-shadow: 0 0 28px rgba(255, 0, 0, 0.8), inset 0 0 21px rgba(255, 0, 0, 0.2);
        }
      }

      .urgent-glow {
        animation: urgent-glow 2s ease-in-out infinite;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
        height: 5px;
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