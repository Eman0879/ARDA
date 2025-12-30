// app/components/depthead-project/utils.tsx

import React from 'react';

// Note: These functions are kept for backward compatibility
// New code should use cardCharacters from useTheme() instead
export const getPriorityColor = (priority: string, theme: string) => {
  const colors = {
    low: theme === 'dark' ? 'text-green-400 border-green-500' : 'text-green-600 border-green-400',
    medium: theme === 'dark' ? 'text-yellow-400 border-yellow-500' : 'text-yellow-600 border-yellow-400',
    high: theme === 'dark' ? 'text-orange-400 border-orange-500' : 'text-orange-600 border-orange-400',
    urgent: theme === 'dark' ? 'text-red-400 border-red-500' : 'text-red-600 border-red-400'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

export const getStatusColor = (status: string, theme: string) => {
  const colors = {
    pending: theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700',
    todo: theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700',
    'in-progress': theme === 'dark' ? 'bg-blue-900/50 text-[#87CEEB]' : 'bg-blue-100 text-blue-700',
    review: theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700',
    completed: theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700',
    blocked: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700',
    planning: theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700',
    active: theme === 'dark' ? 'bg-blue-900/50 text-[#87CEEB]' : 'bg-blue-100 text-blue-700',
    'on-hold': theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    cancelled: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

// Updated to work with both theme string and colors object
export const renderDescriptionWithMentions = (text: string, themeOrColors: any) => {
  const regex = /@\[([^\]]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Check if we're receiving colors object or theme string
  const accentColor = typeof themeOrColors === 'string' 
    ? (themeOrColors === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]')
    : themeOrColors.textAccent || 'text-[#0000FF]';

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span
        key={match.index}
        className={`font-semibold ${accentColor}`}
      >
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
};

export const uploadFile = async (file: File, userId: string, userName: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.success) {
    return {
      ...data.data,
      uploadedBy: {
        employeeId: userId,
        name: userName
      },
      uploadedAt: new Date().toISOString()
    };
  }
  throw new Error(data.error || 'Upload failed');
};