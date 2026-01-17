// ============================================
// app/components/super/workflows/WorkflowLoadingState.tsx
// Theme-matched loading states for workflow pages
// ============================================

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Loader2, Users, Workflow } from 'lucide-react';

interface WorkflowLoadingStateProps {
  message?: string;
  type?: 'page' | 'modal' | 'inline';
}

export default function WorkflowLoadingState({ 
  message = 'Loading workflows...', 
  type = 'page' 
}: WorkflowLoadingStateProps) {
  const { colors } = useTheme();

  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className={`w-5 h-5 animate-spin ${colors.textAccent}`} />
        <p className={`text-sm ${colors.textSecondary}`}>{message}</p>
      </div>
    );
  }

  if (type === 'modal') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="relative">
          {/* Outer Ring */}
          <div 
            className="absolute inset-0 rounded-full animate-spin"
            style={{ 
              border: '3px solid transparent',
              borderTopColor: '#2196F3',
              borderRightColor: '#64B5F6',
              animationDuration: '1s'
            }}
          />
          
          {/* Inner Ring */}
          <div 
            className="absolute inset-2 rounded-full animate-spin"
            style={{ 
              border: '3px solid transparent',
              borderBottomColor: '#64B5F6',
              borderLeftColor: '#90CAF9',
              animationDuration: '1.5s',
              animationDirection: 'reverse'
            }}
          />
          
          {/* Icon */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Workflow className={`w-6 h-6 ${colors.textAccent}`} />
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className={`text-sm font-medium ${colors.textPrimary}`}>{message}</p>
          <p className={`text-xs ${colors.textMuted}`}>Please wait...</p>
        </div>
      </div>
    );
  }

  // Full page loading
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.background}`}>
      {/* Paper Texture Background */}
      <div className={`fixed inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, transparent 70%)',
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(100, 181, 246, 0.3) 0%, transparent 70%)',
            animationDuration: '6s',
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Main Spinner with Glow */}
        <div className="relative mx-auto w-20 h-20">
          {/* Outer Ring */}
          <div 
            className="absolute inset-0 rounded-full animate-spin"
            style={{ 
              border: '3px solid transparent',
              borderTopColor: '#2196F3',
              borderRightColor: '#64B5F6',
              animationDuration: '1s'
            }}
          />
          
          {/* Inner Ring */}
          <div 
            className="absolute inset-2 rounded-full animate-spin"
            style={{ 
              border: '3px solid transparent',
              borderBottomColor: '#64B5F6',
              borderLeftColor: '#90CAF9',
              animationDuration: '1.5s',
              animationDirection: 'reverse'
            }}
          />
          
          {/* Center Icon */}
          <div 
            className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center"
          >
            <Users className={`w-6 h-6 ${colors.textAccent}`} />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className={`text-2xl font-bold ${colors.textPrimary} animate-pulse`}>
            {message}
          </h2>
          
          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#2196F3',
                animationDelay: '0s',
                animationDuration: '1s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#64B5F6',
                animationDelay: '0.2s',
                animationDuration: '1s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ 
                backgroundColor: '#90CAF9',
                animationDelay: '0.4s',
                animationDuration: '1s'
              }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div 
            className="h-1 rounded-full overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(100, 181, 246, 0.1)'
            }}
          >
            <div 
              className="h-full rounded-full animate-progress"
              style={{ 
                background: 'linear-gradient(90deg, #2196F3, #64B5F6, #90CAF9)',
                boxShadow: '0 0 10px rgba(100, 181, 246, 0.5)'
              }}
            />
          </div>
        </div>

        {/* Subtitle */}
        <p className={`text-sm ${colors.textSecondary} font-medium`}>
          Setting up your workspace...
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.5;
          }
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Skeleton loader for workflow cards
export function WorkflowCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} p-4 ${colors.cardBg}`}>
      <div className="animate-pulse space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className={`h-5 ${colors.inputBg} rounded w-3/4`}></div>
            <div className={`h-3 ${colors.inputBg} rounded w-1/2`}></div>
          </div>
          <div className={`h-8 w-8 ${colors.inputBg} rounded-lg`}></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className={`h-3 ${colors.inputBg} rounded w-full`}></div>
          <div className={`h-3 ${colors.inputBg} rounded w-5/6`}></div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2">
          <div className={`h-6 ${colors.inputBg} rounded-full w-20`}></div>
          <div className={`h-6 ${colors.inputBg} rounded-full w-24`}></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for workflow list
export function WorkflowListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <WorkflowCardSkeleton key={i} />
      ))}
    </div>
  );
}