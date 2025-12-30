// app/components/employeeticketlogs/AnalyticsLoadingState.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Loader2 } from 'lucide-react';

export default function AnalyticsLoadingState() {
  const { colors } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className={`relative flex items-center gap-4 p-4 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
        <div className="relative flex-1 space-y-2">
          <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse" />
        </div>
      </div>

      {/* Chart and legend skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart skeleton */}
        <div className={`relative flex items-center justify-center p-8 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <Loader2 className={`h-32 w-32 ${colors.textAccent} animate-spin`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`relative flex items-center justify-between p-3 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative flex items-center gap-3 flex-1">
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
              </div>
              <div className="relative flex items-center gap-4">
                <div className="h-6 w-8 bg-gray-700 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent tickets skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`relative p-4 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            <div className="relative space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded w-48 animate-pulse" />
                </div>
              </div>
              <div className={`flex items-center justify-between pt-3 border-t ${colors.border}`}>
                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}