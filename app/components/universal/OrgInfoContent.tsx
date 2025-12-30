// ===== app/components/universal/OrgInfoContent.tsx =====
'use client';

import React from 'react';
import { Building2, Users, Globe, Target, TrendingUp, Award, Zap } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function OrgInfoContent() {
  const { colors } = useTheme();
  
  const orgStats = [
    { label: 'Global Presence', value: '200+', subtitle: 'Countries', icon: <Globe className="h-5 w-5" />, color: '#0000FF' },
    { label: 'Team Members', value: '270K+', subtitle: 'Worldwide', icon: <Users className="h-5 w-5" />, color: '#6495ED' },
    { label: 'Market Leader', value: '#2', subtitle: 'Global Rank', icon: <Award className="h-5 w-5" />, color: '#FF0000' },
    { label: 'Annual Growth', value: '12%', subtitle: 'Year over Year', icon: <TrendingUp className="h-5 w-5" />, color: '#DC143C' }
  ];

  const departments = [
    { name: 'Sales & Marketing', color: '#0000FF', employees: '45K+' },
    { name: 'Operations', color: '#6495ED', employees: '80K+' },
    { name: 'Supply Chain', color: '#87CEEB', employees: '65K+' },
    { name: 'Finance', color: '#FF0000', employees: '15K+' },
    { name: 'Human Resources', color: '#DC143C', employees: '12K+' },
    { name: 'IT & Technology', color: '#0000FF', employees: '18K+' }
  ];

  return (
    <div className="space-y-5">
      <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl p-5 border ${colors.borderStrong}`}>
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-[#0000FF]" />
          <div>
            <h2 className={`text-2xl font-black ${colors.textPrimary} mb-1`}>Organization Info</h2>
            <p className={`${colors.textAccent} text-sm font-semibold`}>Learn about our company structure and global presence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {orgStats.map((stat, index) => (
          <div key={index} className={`group relative bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl p-4 border ${colors.border} hover:border-[#0000FF] transition-all duration-300 overflow-hidden transform hover:scale-105 cursor-pointer`} style={{ boxShadow: `0 0 15px ${stat.color}20` }}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: stat.color }}></div>

            <div className="relative">
              <div className="inline-flex p-2 rounded-lg mb-3 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}30`, boxShadow: `0 0 10px ${stat.color}30` }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>

              <div className={`text-3xl font-black ${colors.textPrimary} mb-1 group-hover:scale-110 transition-transform`}>{stat.value}</div>
              <div className={`text-sm font-bold ${colors.textAccent} mb-1`}>{stat.label}</div>
              <div className={`text-xs ${colors.textMuted} font-semibold`}>{stat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`relative bg-gradient-to-br from-[#0000FF]/20 to-[#6495ED]/20 backdrop-blur-lg rounded-xl p-5 border border-[#0000FF]/40 hover:border-[#0000FF] transition-all duration-300 overflow-hidden group`}>
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#0000FF] rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#0000FF] rounded-xl shadow-lg shadow-[#0000FF]/50">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-xl font-black ${colors.textPrimary}`}>Our Mission</h3>
            </div>
            <p className={`${colors.textAccent} text-sm leading-relaxed font-semibold`}>To create more smiles with every sip and every bite, while building a sustainable and responsible business for future generations.</p>
          </div>
        </div>

        <div className={`relative bg-gradient-to-br from-[#FF0000]/20 to-[#DC143C]/20 backdrop-blur-lg rounded-xl p-5 border border-[#FF0000]/40 hover:border-[#FF0000] transition-all duration-300 overflow-hidden group`}>
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#FF0000] rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#FF0000] rounded-xl shadow-lg shadow-[#FF0000]/50">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-xl font-black ${colors.textPrimary}`}>Our Vision</h3>
            </div>
            <p className={`${colors.textAccent} text-sm leading-relaxed font-semibold`}>To be the global leader in beverages and convenient foods by winning with purpose and creating value for all stakeholders.</p>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${colors.glassBg} backdrop-blur-lg rounded-xl p-5 border ${colors.border}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#0000FF]/20 rounded-lg">
            <Users className="h-5 w-5 text-[#0000FF]" />
          </div>
          <h3 className={`text-xl font-black ${colors.textPrimary}`}>Departments</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept, index) => (
            <div key={index} className={`group relative bg-gradient-to-br from-gray-800/60 to-black/60 rounded-lg p-4 border ${colors.border} ${colors.borderHover} transition-all duration-300 overflow-hidden cursor-pointer`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at top right, ${dept.color}15, transparent)` }}></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-sm font-bold ${colors.textPrimary} group-hover:${colors.textAccent} transition-colors`}>{dept.name}</h4>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }}></div>
                </div>
                <div className={`${colors.textAccent} text-xs font-semibold`}>{dept.employees} employees</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}