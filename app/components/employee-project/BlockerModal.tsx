// app/components/employee-project/BlockerModal.tsx

import { useState } from 'react';
import { X } from 'lucide-react';
import { Sprint, Task } from '../depthead-project/types';

interface BlockerModalProps {
  show: boolean;
  onClose: () => void;
  item: Sprint | Task | null;
  onReportBlocker: (reason: string) => Promise<void>;
  theme: string;
}

export default function BlockerModal({
  show,
  onClose,
  item,
  onReportBlocker,
  theme
}: BlockerModalProps) {
  const [blockerReason, setBlockerReason] = useState('');

  if (!show || !item) return null;

  const handleReport = async () => {
    if (!blockerReason.trim()) {
      alert('Please describe the blocker');
      return;
    }
    await onReportBlocker(blockerReason);
    setBlockerReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-black border border-[#000080]'
          : 'bg-white border border-gray-300'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Report Blocker
          </h2>
          <button
            onClick={() => {
              onClose();
              setBlockerReason('');
            }}
            className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Describe what's blocking you from completing this work:
          </p>
          <textarea
            value={blockerReason}
            onChange={(e) => setBlockerReason(e.target.value)}
            placeholder="E.g., Waiting for API documentation, Need access to database..."
            rows={4}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-black/60 border-[#000080] text-white placeholder-white/50'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReport}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Report Blocker
          </button>
          <button
            onClick={() => {
              onClose();
              setBlockerReason('');
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}