// app/(Dashboard)/admin/components/AdminSidebar.tsx
'use client';

import React, { useState } from 'react';
import { 
  Home,
  FileText, 
  Building2, 
  GitBranch, 
  Clock, 
  ChevronRight,
  Settings,
  Users,
  Shield,
  Download
} from 'lucide-react';
import Image from 'next/image';

export type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  visible: boolean;
  isExternal?: boolean;
  externalUrl?: string;
};

interface AdminSidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export default function AdminSidebar({ activeItem, onItemClick }: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      color: '#0000FF',
      visible: true
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: <FileText className="h-5 w-5" />,
      color: '#0000FF',
      visible: true
    },
    {
      id: 'org-info',
      label: 'Org Info',
      icon: <Building2 className="h-5 w-5" />,
      color: '#6495ED',
      visible: true
    },
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: <Users className="h-5 w-5" />,
      color: '#FFD700',
      visible: true
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <GitBranch className="h-5 w-5" />,
      color: '#FF0000',
      visible: true
    },
    {
      id: 'timetrax',
      label: 'TimeTrax',
      icon: <Clock className="h-5 w-5" />,
      color: '#DC143C',
      visible: true,
      isExternal: true,
      externalUrl: 'http://192.168.9.20:90/Login.aspx'
    },
    {
      id: 'download-logs',
      label: 'Download Logs',
      icon: <Download className="h-5 w-5" />,
      color: '#800080',
      visible: true
    }
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.isExternal && item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    } else {
      onItemClick(item.id);
    }
  };

  return (
    <div className="w-80 h-screen bg-gradient-to-b from-[#000000] via-[#0a0a1a] to-[#000000] border-r-2 border-[#000080]/50 flex flex-col relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0000FF]/5 via-transparent to-[#FF0000]/5 pointer-events-none"></div>

      {/* Logo Section */}
      <div className="relative p-8 border-b-2 border-[#000080]/50">
        <div className="flex items-center justify-center">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0000FF] to-[#FF0000] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-br from-[#0000FF]/20 via-[#6495ED]/10 to-[#000080]/20 p-4 rounded-2xl shadow-2xl border border-[#0000FF]/30">
              <Image
                src="/NewPepsi.png"
                alt="Pepsi Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-xs font-bold text-[#87CEEB] uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Control Hub
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="relative flex-1 overflow-y-auto py-6 px-4 space-y-3 custom-scrollbar">
        {sidebarItems
          .filter(item => item.visible)
          .map((item) => {
            const isActive = activeItem === item.id && !item.isExternal;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full group relative overflow-hidden rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#0000FF]/30 to-[#6495ED]/30 border-2 border-[#0000FF] shadow-lg shadow-[#0000FF]/30' 
                    : 'bg-gray-900/40 border-2 border-[#000080]/40 hover:border-[#0000FF]/60 hover:bg-gray-900/60'
                  }
                `}
              >
                {/* Hover Gradient */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-[#0000FF]/20 via-[#6495ED]/10 to-transparent 
                  transition-transform duration-300
                  ${isHovered || isActive ? 'translate-x-0' : '-translate-x-full'}
                `}></div>

                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'shadow-lg' 
                        : 'bg-gray-800/60 group-hover:bg-gray-700/80'
                      }
                    `} style={{
                      backgroundColor: isActive ? item.color : undefined,
                      boxShadow: isActive ? `0 0 20px ${item.color}60` : undefined
                    }}>
                      <div className={`
                        transition-all duration-300
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                      `}>
                        {item.icon}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="text-left">
                      <div className={`
                        font-bold text-base transition-colors duration-300
                        ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                      `}>
                        {item.label}
                      </div>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight className={`
                    h-5 w-5 transition-all duration-300
                    ${isActive 
                      ? 'text-[#87CEEB] translate-x-0 opacity-100' 
                      : 'text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#87CEEB]'
                    }
                  `} />
                </div>

                {/* Active Indicator Bar */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
                    style={{ 
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}`
                    }}
                  ></div>
                )}
              </button>
            );
          })}
      </div>

      {/* Bottom Section - Settings */}
      <div className="relative p-4 border-t-2 border-[#000080]/50">
        <button 
          onClick={() => onItemClick('settings')}
          className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
            activeItem === 'settings'
              ? 'bg-gradient-to-r from-[#0000FF]/30 to-[#6495ED]/30 border-2 border-[#0000FF]'
              : 'bg-gray-900/50 hover:bg-gray-800/70 border-2 border-[#000080]/40 hover:border-[#0000FF]/60'
          }`}
        >
          <div className={`p-2.5 rounded-lg transition-all duration-300 ${
            activeItem === 'settings'
              ? 'bg-[#0000FF] shadow-lg shadow-[#0000FF]/50'
              : 'bg-gray-800/50 group-hover:bg-[#0000FF]'
          }`}>
            <Settings className={`h-5 w-5 transition-colors duration-300 ${
              activeItem === 'settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`} />
          </div>
          <span className={`font-bold transition-colors ${
            activeItem === 'settings' ? 'text-white' : 'text-gray-300 group-hover:text-white'
          }`}>
            Settings
          </span>
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 128, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #0000FF, #6495ED);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6495ED, #0000FF);
        }
      `}</style>
    </div>
  );
}