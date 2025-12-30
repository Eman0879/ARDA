// app/components/depthead-project/DeleteConfirmModal.tsx

import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string;
  itemType: string;
  theme: string;
}

export default function DeleteConfirmModal({
  show,
  onClose,
  onConfirm,
  itemTitle,
  itemType
}: DeleteConfirmModalProps) {
  const { colors, cardCharacters } = useTheme();
  const urgentChar = cardCharacters.urgent;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Paper Texture Overlay */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      <div className={`relative rounded-2xl p-8 w-full max-w-md ${colors.shadowDropdown} backdrop-blur-md border ${urgentChar.border}`}>
        {/* Paper texture in modal */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] rounded-2xl pointer-events-none`}></div>
        
        <div className={`relative bg-gradient-to-br ${colors.cardBg} rounded-2xl p-8 -m-8`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border bg-gradient-to-br ${urgentChar.bg} ${urgentChar.border}`}>
                <AlertTriangle className={`w-7 h-7 ${urgentChar.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
                  Confirm Delete
                </h2>
                <p className={`text-sm mt-1 ${colors.textSecondary}`}>
                  This action is permanent
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all ${colors.textMuted} hover:${colors.textPrimary} ${colors.buttonGhostHover}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8 space-y-4">
            <p className={`text-base ${colors.textPrimary}`}>
              Are you sure you want to delete this {itemType}?
            </p>
            <div className={`p-4 rounded-xl border-l-4 border ${colors.cardBg} ${colors.borderStrong}`}>
              <p className={`text-sm uppercase tracking-wide mb-1 ${colors.textMuted}`}>
                {itemType}
              </p>
              <p className={`font-semibold ${colors.textPrimary}`}>
                {itemTitle}
              </p>
            </div>
            <div className={`flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br ${urgentChar.bg}`}>
              <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${urgentChar.iconColor}`} />
              <p className={`text-sm ${urgentChar.text}`}>
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all border ${colors.buttonSecondary} ${colors.buttonSecondaryText} ${colors.buttonSecondaryHover} ${colors.border}`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`group relative flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all overflow-hidden bg-gradient-to-r ${urgentChar.bg} ${urgentChar.text} hover:${urgentChar.hoverBg} border ${urgentChar.border} ${colors.shadowCard}`}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Paper Texture Layer */}
              <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
              
              {/* Internal Glow Layer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.2)' }}>
              </div>
              
              <Trash2 className="w-4 h-4 relative z-10 group-hover:rotate-12 group-hover:translate-x-1 transition-all duration-300" />
              <span className="relative z-10">Delete {itemType}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}