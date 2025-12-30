// components/layout/sidebar.tsx
'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  GitBranch, 
  Clock, 
  ChevronRight,
  Home,
  Settings
} from 'lucide-react';

export type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  visible: boolean;
};

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  userRole?: string;
}

export default function Sidebar({ items, activeItem, onItemClick, userRole }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="w-80 h-screen bg-gradient-to-b from-black via-gray-950 to-black border-r border-[#000080]/30 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-40 h-40 bg-[#0000FF] rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 -right-20 w-40 h-40 bg-[#FF0000] rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* Logo Section */}
      <div className="relative p-8 border-b border-[#000080]/30">
        <div className="flex items-center justify-center">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0000FF] to-[#FF0000] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-[#0000FF] to-[#000080] p-4 rounded-2xl shadow-xl">
              <div className="text-3xl font-black text-white tracking-tight">PEPSI</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
            Employee Hub
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="relative flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {items
          .filter(item => item.visible)
          .map((item) => {
            const isActive = activeItem === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full group relative overflow-hidden rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#0000FF]/20 to-[#6495ED]/20 border-2 border-[#0000FF]' 
                    : 'bg-gray-900/40 border-2 border-[#000080]/30 hover:border-[#0000FF]/50'
                  }
                `}
              >
                {/* Hover Effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-[#0000FF]/10 to-transparent 
                  transition-transform duration-300
                  ${isHovered || isActive ? 'translate-x-0' : '-translate-x-full'}
                `}></div>

                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`
                      p-2.5 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'shadow-lg' 
                        : 'bg-gray-800/50 group-hover:bg-gray-800'
                      }
                    `} style={{
                      backgroundColor: isActive ? item.color : undefined,
                      boxShadow: isActive ? `0 10px 25px ${item.color}40` : undefined
                    }}>
                      <div className={`
                        transition-all duration-300
                        ${isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:text-white'}
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
                      ? 'text-[#0000FF] translate-x-0 opacity-100' 
                      : 'text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }
                  `} />
                </div>

                {/* Active Indicator Bar */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                )}
              </button>
            );
          })}
      </div>

      {/* Bottom Section - Settings */}
      <div className="relative p-4 border-t border-[#000080]/30">
        <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-900/40 hover:bg-gray-800/60 border-2 border-[#000080]/30 hover:border-[#0000FF]/50 transition-all duration-300 group">
          <div className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-gray-700 transition-colors">
            <Settings className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-gray-300 group-hover:text-white font-semibold transition-colors">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}

// Export default sidebar items for employee
export const getEmployeeSidebarItems = (): SidebarItem[] => [
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
    visible: true
  }
];