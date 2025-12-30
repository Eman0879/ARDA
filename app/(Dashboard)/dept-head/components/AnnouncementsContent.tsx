// app/(Dashboard)/dept-head/components/AnnouncementsContent.tsx
'use client';

import React, { useEffect } from 'react';
import AnnouncementsPage from '@/app/components/DeptHeadAnnouncements/AnnouncementsPage';

interface AnnouncementsContentProps {
  department: string;
  onBack?: () => void;
}

export default function AnnouncementsContent({ department, onBack }: AnnouncementsContentProps) {
  // Get user display name from localStorage
  const [userDisplayName, setUserDisplayName] = React.useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserDisplayName(user.displayName || user.username);
    }
  }, []);

  return (
    <AnnouncementsPage
      department={department}
      userDisplayName={userDisplayName}
      onBack={onBack}
    />
  );
}