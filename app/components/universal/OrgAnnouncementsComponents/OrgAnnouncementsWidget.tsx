// app/components/universal/OrgAnnouncementsComponents/OrgAnnouncementsWidget.tsx
'use client';

import React from 'react';
import { Globe, Pin, ArrowRight } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface OrgAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  edited?: boolean;
  expirationDate?: string;
  borderColor?: string;
}

interface OrgAnnouncementsWidgetProps {
  announcements: OrgAnnouncement[];
  onAnnouncementClick: () => void;
}

export default function OrgAnnouncementsWidget({ 
  announcements, 
  onAnnouncementClick 
}: OrgAnnouncementsWidgetProps) {
  const { theme, colors, cardCharacters } = useTheme();
  
  // Use emerald/teal colors for org announcements (professional, corporate)
  const orgColor = theme === 'dark' ? '#10B981' : '#059669'; // Emerald green
  const orgColorLight = theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.15)';
  const orgBorder = theme === 'dark' ? 'border-emerald-500/60' : 'border-emerald-600';

  // Theme-aware text colors
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-white/80' : 'text-gray-700';
  const textMutedColor = theme === 'dark' ? 'text-white/60' : 'text-gray-500';
  const iconColor = theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
  const accentColor = theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700';

  // Show only 3 latest announcements
  const latestAnnouncements = announcements
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className={`h-5 w-5 ${iconColor}`} />
          <h3 className={`text-lg font-black ${colors.textPrimary}`}>
            Organization
          </h3>
        </div>
        {announcements.length > 0 && (
          <button
            onClick={onAnnouncementClick}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${orgBorder} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
          >
            {/* Paper Texture */}
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            
            {/* Internal glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 14px ${orgColor}80, inset 0 0 28px ${orgColor}40` }}
            ></div>
            
            <span className={`text-xs font-bold relative z-10 ${accentColor}`}>View All</span>
            <ArrowRight className={`h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 icon-rotate ${iconColor}`} />
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Globe className={`h-8 w-8 ${colors.textMuted} mx-auto mb-2`} />
            <p className={`${colors.textMuted} text-xs font-semibold`}>No org announcements</p>
          </div>
        ) : (
          latestAnnouncements.map((announcement) => {
            return (
              <button
                key={announcement._id}
                onClick={onAnnouncementClick}
                className={`announcement-card w-full text-left p-3 rounded-lg transition-all duration-300 cursor-pointer border-2 ${orgBorder} group relative overflow-hidden`}
                style={{
                  backgroundColor: orgColorLight
                }}
              >
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>

                {/* Internal glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 20px ${orgColor}80, inset 0 0 40px ${orgColor}40`
                  }}
                ></div>

                <div className="relative z-10">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className={`text-sm font-black ${textColor} line-clamp-1 flex-1`}>
                      {announcement.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {announcement.pinned && (
                        <Pin className={`h-3 w-3 ${iconColor}`} fill="currentColor" />
                      )}
                      {announcement.edited && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-br ${colors.glassBg} ${textMutedColor} opacity-70`}>
                          EDITED
                        </span>
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
                    <span className="font-semibold">
                      By: {announcement.author}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}