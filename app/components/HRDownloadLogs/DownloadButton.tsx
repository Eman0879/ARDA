// app/components/HRDownloadLogs/DownloadButton.tsx
'use client';

import React from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface DownloadButtonProps {
  selectedType: 'org' | 'dept';
  selectedDepartment: string;
  downloading: boolean;
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage: string;
  onDownload: () => void;
  disabled?: boolean;
}

export default function DownloadButton({
  selectedType,
  selectedDepartment,
  downloading,
  status,
  errorMessage,
  onDownload,
  disabled = false
}: DownloadButtonProps) {
  const { colors, cardCharacters } = useTheme();
  
  return (
    <div className="space-y-3">
      {/* Info Box */}
      <div className={`relative overflow-hidden p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <p className={`relative text-xs ${cardCharacters.informative.text} font-semibold`}>
          PDF will include all announcements, comments, attachments, and metadata
        </p>
      </div>

      {/* Status Messages */}
      {status === 'processing' && (
        <div className={`relative overflow-hidden flex items-center gap-2 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <Loader2 className={`relative h-4 w-4 ${cardCharacters.informative.iconColor} animate-spin flex-shrink-0`} />
          <p className={`relative ${cardCharacters.informative.text} font-semibold text-xs`}>Generating PDF... This may take a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className={`relative overflow-hidden flex items-center gap-2 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <CheckCircle className={`relative h-4 w-4 ${cardCharacters.completed.iconColor} flex-shrink-0`} />
          <p className={`relative ${cardCharacters.completed.text} font-semibold text-xs`}>PDF downloaded successfully!</p>
        </div>
      )}

      {status === 'error' && (
        <div className={`relative overflow-hidden flex items-center gap-2 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <AlertCircle className={`relative h-4 w-4 ${cardCharacters.urgent.iconColor} flex-shrink-0`} />
          <p className={`relative ${cardCharacters.urgent.text} font-semibold text-xs`}>{errorMessage}</p>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={downloading || disabled}
        className={`group relative w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden border ${
          downloading || disabled
            ? `${colors.inputBg} ${colors.border} opacity-50 cursor-not-allowed`
            : `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border-transparent ${colors.shadowCard} hover:${colors.shadowHover}`
        }`}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        {!downloading && !disabled && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
          ></div>
        )}
        {downloading ? (
          <>
            <Loader2 className="relative h-4 w-4 animate-spin z-10" />
            <span className="relative text-sm z-10">Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className={`relative h-4 w-4 z-10 transition-transform duration-300 ${!disabled && 'group-hover:translate-y-0.5'}`} />
            <span className="relative text-sm z-10">Download {selectedType === 'org' ? 'Organization' : 'Department'} PDF Log</span>
          </>
        )}
      </button>
    </div>
  );
}