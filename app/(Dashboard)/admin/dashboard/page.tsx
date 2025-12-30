// app/(Dashboard)/admin/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminHomeContent from '../components/AdminHomeContent';
import ManageUsersContent from '../components/AdminManageUsersContent';
import DownloadLogs from '../components/DownloadLogs';
import PoliciesContent from '@/app/components/universal/PoliciesContent';
import OrgInfoContent from '@/app/components/universal/OrgInfoContent';
import WorkflowsContent from '@/app/components/universal/WorkflowsContent';
import SettingsContent from '@/app/components/universal/SettingsContent';

interface UserData {
  username: string;
  role: string;
  displayName: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState<UserData | null>(null);
  const [manageUsersFilter, setManageUsersFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      console.log('Admin Dashboard - User data:', {
        username: parsedUser.username,
        role: parsedUser.role
      });
      
      // Verify user is admin
      if (parsedUser.role !== 'admin') {
        console.log('Access denied - redirecting. Role:', parsedUser.role);
        
        // Redirect based on their actual role
        if (parsedUser.role === 'depthead.hr') {
          router.push('/hr-head/dashboard');
        } else if (parsedUser.role === 'depthead.other') {
          router.push('/dept-head/dashboard');
        } else if (parsedUser.role === 'employee.hr') {
          router.push('/hr-employee/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
        return;
      }
      
      console.log('Access granted to Admin dashboard');
      setUser(parsedUser);
    } else {
      console.log('No user data - redirecting to login');
      router.push('/auth/login');
    }
  }, [router]);

  const handleNavigate = (section: string, filter?: string) => {
    setActiveSection(section);
    if (section === 'manage-users' && filter) {
      setManageUsersFilter(filter);
    } else {
      setManageUsersFilter(undefined);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a1a] to-[#000000] flex items-center justify-center relative overflow-hidden">
        <div className="relative text-center space-y-6">
          <div className="w-20 h-20 border-4 border-[#0000FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-2xl font-black">Loading Admin Dashboard...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#0000FF] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#6495ED] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#FF0000] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <AdminHomeContent onNavigate={handleNavigate} />;
      case 'manage-users':
        return <ManageUsersContent initialFilter={manageUsersFilter} />;
      case 'policies':
        return <PoliciesContent />;
      case 'org-info':
        return <OrgInfoContent />;
      case 'workflows':
        return <WorkflowsContent />;
      case 'download-logs':
        return <DownloadLogs />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <AdminHomeContent onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#000000] via-[#0a0a1a] to-[#000000] overflow-hidden">
      <AdminSidebar
        activeItem={activeSection}
        onItemClick={(section) => handleNavigate(section)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader user={user} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#000000] via-[#0a0a1a] to-[#000000] p-8 relative custom-scrollbar">
          <div className="relative max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
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