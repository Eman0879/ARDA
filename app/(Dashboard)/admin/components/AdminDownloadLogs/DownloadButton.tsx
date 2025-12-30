// app/(Dashboard)/admin/components/AdminDownloadLogs/DownloadButton.tsx
'use client';

import React from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="p-4 bg-[#87CEEB]/10 border-2 border-[#87CEEB]/30 rounded-xl">
        <p className="text-sm text-[#87CEEB] font-semibold">
          The log will include all announcements (including expired and deleted), 
          all comments, timestamps, and metadata in chronological order.
        </p>
      </div>

      {/* Status Messages */}
      {status === 'processing' && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
          <p className="text-blue-400 font-semibold">Generating logs... This may take a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-400 font-semibold">Log downloaded successfully!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400 font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={downloading || disabled}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
          downloading || disabled
            ? 'bg-gray-600 cursor-not-allowed'
            : selectedType === 'org'
              ? 'bg-gradient-to-r from-[#FF0000] to-[#DC143C] hover:from-[#DC143C] hover:to-[#FF0000] shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {downloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Log...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download {selectedType === 'org' ? 'Organization' : 'Department'} Log
          </>
        )}
      </button>
    </div>
  );
}