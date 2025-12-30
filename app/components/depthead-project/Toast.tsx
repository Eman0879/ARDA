// app/components/depthead-project/Toast.tsx

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  theme: string;
}

export default function Toast({ show, message, type, onClose }: ToastProps) {
  const { colors, cardCharacters } = useTheme();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle
  };

  const toastChars = {
    success: cardCharacters.completed,
    error: cardCharacters.urgent,
    warning: cardCharacters.interactive
  };

  const Icon = icons[type];
  const toastChar = toastChars[type];

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top duration-300 pointer-events-auto">
      <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ${colors.shadowToast} min-w-[300px] max-w-md overflow-hidden backdrop-blur-md bg-gradient-to-r ${toastChar.bg} ${toastChar.border}`}>
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        {/* Toast Glow */}
        <div className="absolute inset-0 opacity-50"
             style={{ 
               boxShadow: type === 'success' 
                 ? `inset 0 0 20px ${colors.glowSuccess}` 
                 : type === 'error'
                 ? 'inset 0 0 20px rgba(239, 68, 68, 0.2)'
                 : `inset 0 0 20px ${colors.glowWarning}`
             }}>
        </div>
        
        <div className="relative z-10 flex items-center gap-3 w-full">
          <Icon className={`w-5 h-5 flex-shrink-0 ${toastChar.iconColor}`} />
          <p className={`flex-1 font-medium ${toastChar.text}`}>{message}</p>
          <button
            onClick={onClose}
            className={`flex-shrink-0 hover:opacity-70 transition-opacity ${toastChar.text}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}