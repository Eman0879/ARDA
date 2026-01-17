// app/components/ManageUsersContent/UserDetailModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Save, User as UserIcon } from 'lucide-react';
import { User } from './types';
import { useTheme } from '@/app/context/ThemeContext';
import UserDetailTabs from './UserDetailTabs';
import EditableBasicInfo from './EditableBasicInfo';
import EditableIdentification from './EditableIdentification';
import EditableContactInfo from './EditableContactInfo';
import EditableEducation from './EditableEducation';
import EditableParents from './EditableParents';

interface UserDetailModalProps {
  user: User;
  departments: string[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserDetailModal({ user, departments, onClose, onUpdate }: UserDetailModalProps) {
  const { colors, theme, cardCharacters, showToast } = useTheme();
  const charColors = cardCharacters.authoritative;
  
  const [activeTab, setActiveTab] = useState<'basic' | 'identification' | 'contact' | 'education' | 'parents'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [editedUser, setEditedUser] = useState<User>({ ...user });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/users/full-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, userData: editedUser })
      });

      if (response.ok) {
        showToast('User updated successfully', 'success');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBasicDetails = (field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        [field]: value
      }
    }));
  };

  const updateIdentification = (field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        [field]: value
      }
    }));
  };

  const updateContactInfo = (field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      contactInformation: {
        ...prev.contactInformation,
        [field]: value
      }
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setEditedUser(prev => {
      const newEducation = [...(prev.educationalDetails || [])];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, educationalDetails: newEducation };
    });
  };

  const addEducation = () => {
    setEditedUser(prev => ({
      ...prev,
      educationalDetails: [
        ...(prev.educationalDetails || []),
        { title: '', degree: '', institute: '', specialization: '', percentage: '' }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    setEditedUser(prev => ({
      ...prev,
      educationalDetails: prev.educationalDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const updateParents = (parent: 'father' | 'mother', field: string, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      parents: {
        ...prev.parents,
        [parent]: {
          ...prev.parents?.[parent],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className={`relative overflow-hidden rounded-xl border-2 ${charColors.border} w-full max-w-5xl my-6 ${colors.shadowDropdown} ${theme === 'light' ? 'bg-white' : `bg-gradient-to-br ${colors.cardBg}`}`}>
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        {/* Header - Sticky */}
        <div className={`relative p-4 border-b-2 ${charColors.border} flex items-center justify-between sticky top-0 backdrop-blur-xl z-10 rounded-t-xl ${theme === 'light' ? 'bg-white' : `bg-gradient-to-br ${colors.cardBg}`}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          
          <div className="relative flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <UserIcon className={`h-5 w-5 ${charColors.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black ${colors.textPrimary}`}>
                {editedUser.basicDetails?.name || 'User Details'}
              </h2>
              <p className={`${colors.textAccent} text-xs font-semibold mt-0.5`}>
                {editedUser.username} • {editedUser.employeeNumber}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <Save className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={onClose}
              className={`group relative p-2 rounded-lg transition-all duration-300 hover:scale-105 overflow-hidden border-2 ${charColors.border} ${charColors.hoverBg} ${theme === 'light' ? 'bg-blue-50' : `bg-gradient-to-br ${colors.cardBg}`}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
              ></div>
              <X className={`h-5 w-5 relative z-10 ${charColors.iconColor}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative px-4 pt-4">
          <UserDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="relative p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <EditableBasicInfo
              user={editedUser}
              departments={departments}
              onUpdate={(field, value) => {
                if (field === 'department' || field === 'title' || field === 'employeeNumber' || field === 'joiningDate') {
                  setEditedUser(prev => ({ ...prev, [field]: value }));
                } else {
                  updateBasicDetails(field, value);
                }
              }}
            />
          )}

          {activeTab === 'identification' && (
            <EditableIdentification
              identification={editedUser.identification || {}}
              onUpdate={updateIdentification}
            />
          )}

          {activeTab === 'contact' && (
            <EditableContactInfo
              contactInfo={editedUser.contactInformation || {}}
              onUpdate={updateContactInfo}
            />
          )}

          {activeTab === 'education' && (
            <EditableEducation
              education={editedUser.educationalDetails || []}
              onUpdate={updateEducation}
              onAdd={addEducation}
              onRemove={removeEducation}
            />
          )}

          {activeTab === 'parents' && (
            <EditableParents
              parents={editedUser.parents}
              onUpdate={updateParents}
            />
          )}
        </div>
      </div>
    </div>
  );
}