// app/components/DeptHeadAnnouncements/AnnouncementsBoardWidget.tsx
'use client';

import React from 'react';
import { Pin, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { Announcement } from './types';

interface AnnouncementsBoardWidgetProps {
  announcements: Announcement[];
  onAnnouncementClick: () => void;
}

export default function AnnouncementsBoardWidget({ 
  announcements, 
  onAnnouncementClick 
}: AnnouncementsBoardWidgetProps) {
  const { theme, colors, cardCharacters } = useTheme();

  // Show only 3 latest announcements
  const latestAnnouncements = announcements
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Theme-aware text colors
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-white/80' : 'text-gray-700';
  const textMutedColor = theme === 'dark' ? 'text-white/60' : 'text-gray-500';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pin className={`h-5 w-5 ${cardCharacters.informative.iconColor}`} />
          <h3 className={`text-lg font-black ${colors.textPrimary}`}>
            Dept Announcements
          </h3>
        </div>
        {announcements.length > 0 && (
          <button
            onClick={onAnnouncementClick}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${cardCharacters.informative.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
          >
            {/* Paper Texture */}
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            
            {/* Internal glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
            ></div>
            
            <span className={`text-xs font-bold relative z-10 ${cardCharacters.informative.accent}`}>View All</span>
            <ArrowRight className={`h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 icon-rotate ${cardCharacters.informative.iconColor}`} />
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Pin className={`h-8 w-8 ${colors.textMuted} mx-auto mb-2`} />
            <p className={`${colors.textMuted} text-xs font-semibold`}>No announcements yet</p>
          </div>
        ) : (
          latestAnnouncements.map((announcement) => {
            const announcementColor = announcement.color || '#2196F3';
            
            return (
              <button
                key={announcement._id}
                onClick={onAnnouncementClick}
                className={`announcement-card w-full text-left p-3 rounded-lg transition-all duration-300 cursor-pointer border-2 group relative overflow-hidden ${
                  announcement.urgent ? 'urgent-glow' : ''
                }`}
                style={{
                  backgroundColor: `${announcementColor}${theme === 'dark' ? '20' : '15'}`,
                  borderColor: announcementColor,
                  ['--glow-color' as any]: announcementColor
                }}
              >
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>

                {/* Internal glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 20px ${announcementColor}80, inset 0 0 40px ${announcementColor}40`
                  }}
                ></div>

                <div className="relative z-10">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className={`text-sm font-black ${textColor} line-clamp-1 flex-1`}>
                      {announcement.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {announcement.urgent && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FF0000] rounded text-[10px] font-black text-white">
                          <AlertCircle className="h-2.5 w-2.5" />
                          URGENT
                        </div>
                      )}
                      {announcement.pinned && !announcement.urgent && (
                        <Pin className="h-3 w-3 text-[#FFD700]" fill="#FFD700" />
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className={`text-xs ${textSecondaryColor} line-clamp-2 mb-2 font-medium`}>
                    {truncateText(announcement.content, 80)}
                  </p>

                  {/* Footer */}
                  <div className={`flex items-center justify-between text-[10px] ${textMutedColor}`}>
                    <span className="font-semibold">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span className="font-semibold">{announcement.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <style jsx>{`
        @keyframes urgent-pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--glow-color), inset 0 0 20px var(--glow-color);
          }
          50% {
            box-shadow: 0 0 40px var(--glow-color), inset 0 0 40px var(--glow-color);
          }
        }

        .announcement-card.urgent-glow {
          animation: urgent-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}