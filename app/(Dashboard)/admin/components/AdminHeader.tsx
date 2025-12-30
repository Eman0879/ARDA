// app/(Dashboard)/admin/components/AdminHeader.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Briefcase, Mail, Phone, Shield } from 'lucide-react';

interface UserData {
  username: string;
  role: string;
  displayName: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
}

interface AdminHeaderProps {
  user: UserData;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-black via-gray-950 to-black border-b-2 border-[#000080]/50">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* User Info Section */}
          <div className="flex items-center space-x-6">
            {/* User Details */}
            <div className="space-y-3">
              {/* Name with Employee Number and Badge */}
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black text-white">
                  {user.displayName}
                </h1>
                <div className="flex items-center gap-3">
                  {user.employeeNumber && (
                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#0000FF] to-[#6495ED] text-white text-sm font-bold rounded-lg border border-[#87CEEB]/30">
                      ID: {user.employeeNumber}
                    </span>
                  )}
                  <span className="px-4 py-1.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-lg border border-[#FFD700]/50 flex items-center gap-2 shadow-lg shadow-[#FFD700]/20">
                    <Shield className="h-4 w-4" />
                    ADMIN
                  </span>
                </div>
              </div>

              {/* Info Tags */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 rounded-lg border border-[#0000FF]/40">
                  <Briefcase className="h-4 w-4 text-[#87CEEB]" />
                  <span className="font-bold text-white">System Administrator</span>
                </div>
                
                {user.email && (
                  <>
                    <div className="w-1.5 h-1.5 bg-[#87CEEB]/50 rounded-full"></div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 rounded-lg border border-[#FF0000]/40">
                      <Mail className="h-4 w-4 text-[#87CEEB]" />
                      <span className="font-bold text-white">{user.email}</span>
                    </div>
                  </>
                )}
                
                {user.phone && (
                  <>
                    <div className="w-1.5 h-1.5 bg-[#87CEEB]/50 rounded-full"></div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 rounded-lg border border-[#DC143C]/40">
                      <Phone className="h-4 w-4 text-[#87CEEB]" />
                      <span className="font-bold text-white">{user.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#FF0000] to-[#DC143C] hover:from-[#DC143C] hover:to-[#FF0000] rounded-xl transition-all duration-300 shadow-lg shadow-[#FF0000]/40 hover:shadow-xl hover:shadow-[#FF0000]/50 transform hover:scale-105 active:scale-95 border-2 border-[#FF0000]/50"
          >
            <span className="text-white font-black text-lg tracking-wide">LOGOUT</span>
            <LogOut className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}