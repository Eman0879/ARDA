// ===== app/components/appointments/AppointmentRequest.tsx =====
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { X, Send, Search, Calendar, Clock, User, AlertCircle } from 'lucide-react';

interface AppointmentRequestProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface UserOption {
  username: string;
  displayName: string;
  department: string;
  title: string;
  employeeId?: string;
}

export default function AppointmentRequest({ onClose, onSuccess }: AppointmentRequestProps) {
  const { colors, cardCharacters, theme } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedDate: new Date().toISOString().split('T')[0],
    proposedStartTime: '',
    proposedEndTime: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
        setShowUserDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      const response = await fetch(`/api/appointments/users?search=${encodeURIComponent(query)}&currentUsername=${user.username}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setShowUserDropdown(data.users.length > 0);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedUser) {
      newErrors.user = 'Please select a recipient';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.proposedDate) {
      newErrors.date = 'Date is required';
    }

    if (!formData.proposedStartTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.proposedEndTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.proposedStartTime && formData.proposedEndTime) {
      if (formData.proposedEndTime <= formData.proposedStartTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    const selectedDate = new Date(formData.proposedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'Cannot schedule appointments in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData || !selectedUser) return;

      const user = JSON.parse(userData);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.username,
          requesterUsername: user.username,
          requestedId: selectedUser.username,
          requestedUsername: selectedUser.username,
          title: formData.title,
          description: formData.description,
          proposedDate: formData.proposedDate,
          proposedStartTime: formData.proposedStartTime,
          proposedEndTime: formData.proposedEndTime
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: responseData.error || 'Failed to send appointment request' });
      }
    } catch (error) {
      console.error('Failed to send appointment request:', error);
      setErrors({ submit: 'Failed to send appointment request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative overflow-hidden rounded-xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] dark:bg-opacity-90"
        style={{
          borderColor: theme === 'light' ? '#E0E0E0' : '#334155',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.scrollbarThumb} ${colors.scrollbarTrack}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>

        {/* Header */}
        <div 
          className="sticky top-0 z-10 backdrop-blur-md border-b p-4 bg-white dark:bg-[#1E293B] dark:bg-opacity-90"
          style={{ borderColor: theme === 'light' ? '#E0E0E0' : '#334155' }}
        >
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Calendar className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-lg font-black ${charColors.text}`}>
                  Request Appointment
                </h2>
                <p className={`text-xs ${colors.textMuted}`}>
                  Schedule a meeting with another user
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`group relative p-2 rounded-lg transition-all duration-300 overflow-hidden ${colors.inputBg} border ${colors.inputBorder} hover:${colors.borderHover}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
              ></div>
              <X className={`h-5 w-5 relative z-10 ${colors.textMuted} group-hover:${charColors.iconColor}`} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-6 space-y-4">
          {/* User Selection */}
          <div className="relative">
            <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
              Select Recipient *
            </label>
            
            {!selectedUser ? (
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.textMuted}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (users.length > 0) setShowUserDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowUserDropdown(false), 200);
                  }}
                  className={`w-full pl-10 pr-3 py-2 ${colors.inputBg} border ${errors.user ? cardCharacters.urgent.border : colors.inputBorder} rounded-lg text-sm ${colors.inputText} ${colors.inputPlaceholder} focus:outline-none transition-all`}
                  style={{
                    borderColor: errors.user ? cardCharacters.urgent.border.replace('border-', '') : undefined,
                    outlineColor: charColors.iconColor.replace('text-', '')
                  }}
                  placeholder="Search by name, username, or employee ID..."
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: charColors.iconColor.replace('text-', '') }}></div>
                  </div>
                )}
                
                {/* User Dropdown */}
                {showUserDropdown && users.length > 0 && (
                  <div 
                    className="absolute z-20 w-full mt-1 rounded-lg border shadow-2xl max-h-60 overflow-y-auto bg-white dark:bg-[#1E293B]"
                    style={{ borderColor: theme === 'light' ? '#E0E0E0' : '#334155' }}
                  >
                    {users.map((user) => (
                      <button
                        key={user.username}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedUser(user);
                          setSearchQuery('');
                          setShowUserDropdown(false);
                          setErrors({ ...errors, user: '' });
                        }}
                        className={`w-full text-left p-3 border-b ${colors.borderSubtle} last:border-b-0 transition-all duration-300 ${colors.dropdownHover}`}
                      >
                        <div className={`font-bold text-sm ${colors.textPrimary}`}>
                          {user.displayName}
                        </div>
                        <div className={`text-xs ${colors.textMuted}`}>
                          @{user.username} {user.employeeId && `• ID: ${user.employeeId}`}
                        </div>
                        <div className={`text-xs ${colors.textMuted}`}>
                          {user.department} • {user.title}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery.trim().length >= 2 && !searching && users.length === 0 && showUserDropdown && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg p-3 bg-white dark:bg-[#1E293B]" style={{ borderColor: theme === 'light' ? '#E0E0E0' : '#334155' }}>
                    <p className={`text-xs ${colors.textMuted}`}>
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center justify-between p-3 ${colors.inputBg} border ${colors.inputBorder} rounded-lg`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                    <User className={`h-4 w-4 ${charColors.iconColor}`} />
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${colors.textPrimary}`}>
                      {selectedUser.displayName}
                    </div>
                    <div className={`text-xs ${colors.textMuted}`}>
                      @{selectedUser.username} • {selectedUser.department}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className={`p-1 rounded transition-all ${colors.inputBg} hover:bg-opacity-70`}
                >
                  <X className={`h-4 w-4 ${colors.textMuted} hover:${cardCharacters.urgent.iconColor}`} />
                </button>
              </div>
            )}
            
            {errors.user && (
              <p className={`text-xs mt-1 flex items-center space-x-1 ${cardCharacters.urgent.text}`}>
                <AlertCircle className="h-3 w-3" />
                <span>{errors.user}</span>
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 ${colors.inputBg} border ${errors.title ? cardCharacters.urgent.border : colors.inputBorder} rounded-lg text-sm ${colors.inputText} ${colors.inputPlaceholder} focus:outline-none transition-all`}
              placeholder="e.g., Project Discussion, Weekly Sync"
            />
            {errors.title && (
              <p className={`text-xs mt-1 flex items-center space-x-1 ${cardCharacters.urgent.text}`}>
                <AlertCircle className="h-3 w-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
              Description / Agenda
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} ${colors.inputPlaceholder} focus:outline-none transition-all resize-none`}
              rows={3}
              placeholder="Add meeting agenda or additional details..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={`flex items-center space-x-2 text-xs font-bold ${colors.textSecondary} mb-2`}>
                <Calendar className={`h-3.5 w-3.5 ${charColors.iconColor}`} />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={formData.proposedDate}
                onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${errors.date ? cardCharacters.urgent.border : colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none transition-all`}
              />
              {errors.date && (
                <p className={`text-xs mt-1 ${cardCharacters.urgent.text}`}>{errors.date}</p>
              )}
            </div>

            <div>
              <label className={`flex items-center space-x-2 text-xs font-bold ${colors.textSecondary} mb-2`}>
                <Clock className={`h-3.5 w-3.5 ${charColors.iconColor}`} />
                <span>Start Time *</span>
              </label>
              <input
                type="time"
                value={formData.proposedStartTime}
                onChange={(e) => setFormData({ ...formData, proposedStartTime: e.target.value })}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${errors.startTime ? cardCharacters.urgent.border : colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none transition-all`}
              />
              {errors.startTime && (
                <p className={`text-xs mt-1 ${cardCharacters.urgent.text}`}>{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className={`flex items-center space-x-2 text-xs font-bold ${colors.textSecondary} mb-2`}>
                <Clock className={`h-3.5 w-3.5 ${charColors.iconColor}`} />
                <span>End Time *</span>
              </label>
              <input
                type="time"
                value={formData.proposedEndTime}
                onChange={(e) => setFormData({ ...formData, proposedEndTime: e.target.value })}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${errors.endTime ? cardCharacters.urgent.border : colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none transition-all`}
              />
              {errors.endTime && (
                <p className={`text-xs mt-1 ${cardCharacters.urgent.text}`}>{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className={`p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} flex items-center space-x-2`}>
              <AlertCircle className={`h-4 w-4 ${cardCharacters.urgent.iconColor}`} />
              <p className={`text-xs ${cardCharacters.urgent.text}`}>{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className={`flex items-center justify-end space-x-2 pt-4 border-t ${colors.border}`}>
            <button
              type="button"
              onClick={onClose}
              className={`group relative px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden ${colors.inputBg} border ${colors.inputBorder} ${colors.textSecondary} hover:${colors.textPrimary}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowSecondary}` }}
              ></div>
              <span className="relative z-10">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              {loading ? (
                <>
                  <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10`}></div>
                  <span className="relative z-10">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="relative z-10">Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}