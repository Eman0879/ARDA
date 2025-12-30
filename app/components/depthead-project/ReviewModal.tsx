// app/components/depthead-project/ReviewModal.tsx

import { X, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Sprint, Task } from './types';

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  item: Sprint | Task | null;
  reviewType: 'approve' | 'reject' | null;
  theme: string;
  onSubmit: (approved: boolean, feedback: string) => void;
}

export default function ReviewModal({
  show,
  onClose,
  item,
  reviewType,
  onSubmit
}: ReviewModalProps) {
  const { colors, cardCharacters } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!show || !item || !reviewType) return null;

  const isApproval = reviewType === 'approve';
  const title = 'title' in item ? item.title : '';
  
  const reviewChar = isApproval ? cardCharacters.completed : cardCharacters.urgent;

  const handleSubmit = () => {
    if (!isApproval && !feedback.trim()) {
      setError('Feedback is required when rejecting');
      return;
    }

    onSubmit(isApproval, feedback);
    setFeedback('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Paper Texture Overlay */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      <div className={`relative rounded-2xl p-8 w-full max-w-lg ${colors.shadowDropdown} backdrop-blur-md border ${colors.borderStrong}`}>
        {/* Paper texture in modal */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] rounded-2xl pointer-events-none`}></div>
        
        <div className={`relative bg-gradient-to-br ${colors.cardBg} rounded-2xl p-8 -m-8`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border bg-gradient-to-br ${reviewChar.bg} ${reviewChar.border}`}>
                {isApproval ? (
                  <CheckCircle className={`w-6 h-6 ${reviewChar.iconColor}`} />
                ) : (
                  <XCircle className={`w-6 h-6 ${reviewChar.iconColor}`} />
                )}
              </div>
              <h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
                {isApproval ? 'Approve' : 'Reject'} Item
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-all ${colors.textMuted} hover:${colors.textPrimary} ${colors.buttonGhostHover}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className={`text-sm mb-2 ${colors.textSecondary}`}>
              Item:
            </p>
            <p className={`font-semibold ${colors.textPrimary}`}>
              {title}
            </p>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${colors.textPrimary}`}>
              Feedback {!isApproval && <span className={colors.textAccent}>*</span>}
              <span className={`font-normal ml-2 ${colors.textSecondary}`}>
                {isApproval ? '(Optional)' : '(Required)'}
              </span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError('');
              }}
              placeholder={isApproval 
                ? 'Add any approval comments or suggestions...'
                : 'Please provide reasons for rejection...'
              }
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} ${colors.inputFocusBg} focus:ring-opacity-50 ${
                error ? 'border-red-500' : ''
              }`}
            />
            {error && (
              <p className={`text-sm mt-2 ${reviewChar.text}`}>{error}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className={`px-6 py-2 rounded-xl font-semibold transition-all border ${colors.buttonSecondary} ${colors.buttonSecondaryText} ${colors.buttonSecondaryHover} ${colors.border}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`group relative flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all overflow-hidden border bg-gradient-to-r ${reviewChar.bg} ${reviewChar.text} hover:${reviewChar.hoverBg} ${reviewChar.border} ${colors.shadowCard}`}
            >
              {/* Paper Texture Layer */}
              <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
              
              {/* Internal Glow Layer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ boxShadow: `inset 0 0 20px ${isApproval ? colors.glowSuccess : 'rgba(239, 68, 68, 0.2)'}` }}>
              </div>
              
              {isApproval ? (
                <>
                  <CheckCircle className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-all duration-300" />
                  <span className="relative z-10">Approve</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-all duration-300" />
                  <span className="relative z-10">Reject</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}