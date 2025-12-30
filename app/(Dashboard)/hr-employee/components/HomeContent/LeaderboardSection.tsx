// app/(Dashboard)/hr-employee/components/HomeContent/LeaderboardSection.tsx
'use client';

import React from 'react';
import { Trophy, Medal, Star, Award } from 'lucide-react';
import { LeaderboardEntry } from './types';

interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[];
  currentUser: any;
}

export default function LeaderboardSection({ leaderboard, currentUser }: LeaderboardSectionProps) {
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="h-6 w-6 text-[#FFD700]" />;
      case 2: return <Medal className="h-6 w-6 text-[#C0C0C0]" />;
      case 3: return <Medal className="h-6 w-6 text-[#CD7F32]" />;
      default: return <Star className="h-5 w-5 text-[#6495ED]" />;
    }
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    if (!currentUser) return false;

    const storedUser = localStorage.getItem('user');
    let currentUserId = null;
    let currentUserName = currentUser?.displayName || currentUser?.username;
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      currentUserId = parsedUser._id || parsedUser.id;
      currentUserName = parsedUser.displayName || parsedUser.username;
    }
    
    return (
      (currentUserId && entry.employeeId === currentUserId) ||
      (currentUserId && entry.employeeId.toString() === currentUserId) ||
      entry.displayName === currentUserName ||
      entry.displayName === currentUser.displayName ||
      entry.displayName === currentUser.username
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#FFD700]/40 sticky top-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-[#FFD700]" />
        <h3 className="text-3xl font-black text-white">Leaderboard</h3>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-[#87CEEB] text-lg font-semibold">No rankings yet</p>
          <p className="text-gray-400 mt-2 text-sm">Check back soon</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {leaderboard.map((entry, index) => {
            const isCurrent = isCurrentUser(entry);
            
            return (
              <div
                key={entry._id}
                className={`
                  relative p-4 rounded-xl transition-all duration-300
                  ${isCurrent ? 'ring-2 ring-[#87CEEB] bg-gradient-to-r from-[#87CEEB]/40 to-[#6495ED]/30 shadow-lg shadow-[#87CEEB]/30' :
                    index === 0 ? 'bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/20 border-2 border-[#FFD700]' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-2 border-gray-400/50' :
                    index === 2 ? 'bg-gradient-to-r from-[#CD7F32]/20 to-[#8B4513]/10 border-2 border-[#CD7F32]/50' :
                    'bg-gray-900/40 border-2 border-[#0000FF]/30'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">{entry.displayName}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-[#87CEEB] rounded text-xs font-black text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400 font-semibold">Rank #{index + 1}</p>
                        <span className="text-gray-500">•</span>
                        <p className="text-xs text-gray-500 font-mono">ID: {entry.employeeNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Award className={`h-5 w-5 ${index === 0 ? 'text-[#FFD700]' : isCurrent ? 'text-[#87CEEB]' : 'text-[#6495ED]'}`} />
                      <span className={`text-2xl font-black ${index === 0 ? 'text-[#FFD700]' : isCurrent ? 'text-[#87CEEB]' : 'text-white'}`}>
                        {entry.points}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}