// ===== app/components/universal/SettingsContent.tsx =====
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  BasicInfoSection, 
  IdentificationSection, 
  ContactInfoSection, 
  EducationSection, 
  ParentsSection 
} from './settingscomponents/ProfileSections';
import PasswordChangeSection from './settingscomponents/PasswordChangeSection';
import ThemeToggle from './settingscomponents/ThemeToggle';

interface EmployeeData {
  username: string;
  department: string;
  title: string;
  isDeptHead: boolean;
  employeeNumber: string;
  basicDetails: {
    title: string;
    name: string;
    fatherName: string;
    gender: string;
    religion: string;
    nationality: string;
    age: string;
    maritalStatus: string;
    profileImage: string;
  };
  identification: {
    CNIC: string;
    birthCountry: string;
    dateOfBirth: string;
    bloodGroup: string;
  };
  contactInformation: {
    contactNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    district: string;
    country: string;
    emergencyNumber: string;
    emergencyRelation: string;
  };
  educationalDetails: Array<{
    title: string;
    degree: string;
    institute: string;
    specialization: string;
    percentage: string;
  }>;
  parents?: {
    father: { name: string; DOB: string };
    mother: { name: string; DOB: string };
  };
  joiningDate: string;
  employeeGroup: string;
  employeeSubGroup: string;
}

interface SettingsContentProps {
  onBack?: () => void;
}

function LoadingState({ onBack }: { onBack?: () => void }) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
            </button>
          )}
          
          <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Settings className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black ${charColors.text}`}>Settings</h2>
            <p className={`text-sm ${colors.textMuted}`}>Loading your settings...</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse`} style={{ backgroundColor: charColors.iconColor.replace('text-', '') }} />
            <Loader2 className={`relative w-12 h-12 animate-spin ${charColors.iconColor}`} />
          </div>
          <p className={`${colors.textSecondary} text-sm font-semibold`}>
            Loading settings...
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack?: () => void }) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
            </button>
          )}
          
          <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Settings className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black ${charColors.text}`}>Settings</h2>
          </div>
        </div>
      </div>
      
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} p-10 text-center`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <div className="mb-6">
            <AlertCircle className={`w-16 h-16 mx-auto ${cardCharacters.urgent.iconColor}`} />
          </div>
          <h3 className={`text-xl font-black ${cardCharacters.urgent.text} mb-3`}>
            Failed to Load Settings
          </h3>
          <p className={`${colors.textSecondary} text-sm mb-6 max-w-md mx-auto`}>
            We couldn't retrieve your employee data. Please try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsContent({ onBack }: SettingsContentProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const response = await fetch(`/api/employee/${user.username}`);
      
      if (response.ok) {
        const data = await response.json();
        setEmployeeData(data.employee);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return <LoadingState onBack={onBack} />;
  }

  if (!employeeData) {
    return <ErrorState onBack={onBack} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      {/* Header with Back Button and Refresh */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={handleBack}
                  className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
                >
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                  ></div>
                  <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
                </button>
              )}

              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Settings className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h1 className={`text-xl font-black ${charColors.text}`}>Settings</h1>
                <p className={`text-xs ${colors.textMuted}`}>
                  Manage your profile and security settings
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchEmployeeData}
              disabled={loading}
              className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover} disabled:opacity-50`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <RefreshCw className={`h-4 w-4 relative z-10 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-sm font-bold relative z-10">Refresh</span>
            </button>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`group relative flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                activeTab === 'profile'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {activeTab === 'profile' && (
                <>
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                </>
              )}
              <User className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Profile Information</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`group relative flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                activeTab === 'password'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {activeTab === 'password' && (
                <>
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                </>
              )}
              <Lock className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'profile' ? (
        <div className="space-y-4">
          <ThemeToggle username={employeeData.username} />
          <BasicInfoSection employeeData={employeeData} />
          <IdentificationSection identification={employeeData.identification} />
          <ContactInfoSection contactInformation={employeeData.contactInformation} />
          <EducationSection educationalDetails={employeeData.educationalDetails} />
          <ParentsSection parents={employeeData.parents} />
        </div>
      ) : (
        <PasswordChangeSection username={employeeData.username} />
      )}
    </div>
  );
}