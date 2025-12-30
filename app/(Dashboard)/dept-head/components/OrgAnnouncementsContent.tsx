// app/(Dashboard)/dept-head/components/OrgAnnouncementsContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import OrgAnnouncementsPage from '@/app/components/universal/OrgAnnouncementsPage';

interface OrgAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  edited?: boolean;
  expirationDate?: string;
  borderColor?: string;
  attachments?: any[];
}

interface OrgAnnouncementsContentProps {
  onBack?: () => void;
}

export default function OrgAnnouncementsContent({ onBack }: OrgAnnouncementsContentProps) {
  const [announcements, setAnnouncements] = useState<OrgAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgAnnouncements();
  }, []);

  const fetchOrgAnnouncements = async () => {
    try {
      const response = await fetch('/api/org-announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching org announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <OrgAnnouncementsPage
      announcements={announcements}
      onBack={onBack}
    />
  );
}