// ===== app/components/universal/settingscomponents/PasswordChangeSection.tsx =====
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface PasswordChangeSectionProps {
  username: string;
}

export default function PasswordChangeSection({ username }: PasswordChangeSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.authoritative;
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/employee/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Lock className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Change Password</h3>
        </div>

        <div className="max-w-2xl space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${colors.textMuted} uppercase tracking-wide`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg transition-all duration-300 text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colors.textMuted} hover:${charColors.iconColor} transition-colors`}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${colors.textMuted} uppercase tracking-wide`}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg transition-all duration-300 text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colors.textMuted} hover:${charColors.iconColor} transition-colors`}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${colors.textMuted} uppercase tracking-wide`}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg transition-all duration-300 text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colors.textMuted} hover:${charColors.iconColor} transition-colors`}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {passwordError && (
            <div className={`relative overflow-hidden border-l-4 p-3 rounded-lg backdrop-blur-sm flex items-center gap-2 bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <AlertCircle className={`h-4 w-4 relative z-10 ${cardCharacters.urgent.iconColor}`} />
              <p className={`relative z-10 text-sm font-semibold ${cardCharacters.urgent.text}`}>{passwordError}</p>
            </div>
          )}

          {/* Success Message */}
          {passwordSuccess && (
            <div className={`relative overflow-hidden border-l-4 p-3 rounded-lg backdrop-blur-sm flex items-center gap-2 bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <CheckCircle2 className={`h-4 w-4 relative z-10 ${cardCharacters.completed.iconColor}`} />
              <p className={`relative z-10 text-sm font-semibold ${cardCharacters.completed.text}`}>{passwordSuccess}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handlePasswordChange}
            disabled={savingPassword}
            className={`group relative w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-black text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
            ></div>
            {savingPassword ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
            ) : (
              <>
                <Save className="h-4 w-4 relative z-10" />
                <span className="relative z-10">SAVE PASSWORD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}