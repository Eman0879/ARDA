// ===== app/components/universal/PoliciesContent.tsx =====
'use client';

import React from 'react';
import { FileText, Shield, Users, Briefcase, Heart, Zap } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function PoliciesContent() {
  const { colors } = useTheme();
  
  const policyCategories = [
    { title: 'Company Policies', icon: <Shield className="h-5 w-5" />, color: '#0000FF', items: ['Code of Conduct', 'Ethics Guidelines', 'Confidentiality Agreement'] },
    { title: 'HR Policies', icon: <Users className="h-5 w-5" />, color: '#6495ED', items: ['Leave Policy', 'Attendance Rules', 'Performance Reviews'] },
    { title: 'Work Policies', icon: <Briefcase className="h-5 w-5" />, color: '#FF0000', items: ['Remote Work', 'Dress Code', 'Working Hours'] },
    { title: 'Benefits', icon: <Heart className="h-5 w-5" />, color: '#DC143C', items: ['Health Insurance', 'Retirement Plans', 'Wellness Programs'] }
  ];

  return (
    <div className="space-y-5">
      <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl p-5 border ${colors.borderStrong}`}>
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-[#0000FF]" />
          <div>
            <h2 className={`text-2xl font-black ${colors.textPrimary} mb-1`}>Policies</h2>
            <p className={`${colors.textAccent} text-sm font-semibold`}>Company policies and guidelines - Stay informed!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policyCategories.map((category, index) => (
          <div key={index} className={`group relative bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl p-5 border ${colors.border} hover:border-[#0000FF] transition-all duration-300 overflow-hidden transform hover:scale-105 cursor-pointer`} style={{ boxShadow: `0 0 15px ${category.color}20` }}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: category.color }}></div>

            <div className="relative">
              <div className="inline-flex p-2.5 rounded-xl mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${category.color}30`, boxShadow: `0 0 15px ${category.color}30` }}>
                <div style={{ color: category.color }}>{category.icon}</div>
              </div>

              <h3 className={`text-lg font-black ${colors.textPrimary} mb-3 group-hover:${colors.textAccent} transition-colors duration-300`}>{category.title}</h3>

              <ul className="space-y-2">
                {category.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 group/item">
                    <Zap className={`h-3 w-3 ${colors.textAccent} group-hover/item:text-[#FF0000] transition-colors`} />
                    <span className={`${colors.textAccent} text-sm font-semibold group-hover/item:${colors.textPrimary} transition-colors`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}