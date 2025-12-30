// app/(Dashboard)/hr-employee/components/HomeContent/types.ts (and similar for other directories)

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
}

export interface Comment {
  _id?: string;
  text: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author?: string;
  department: string;
  createdAt: string;
  pinned?: boolean;
  urgent?: boolean;
  edited?: boolean;
  color: string;
  comments?: Comment[];
  expirationDate?: string;
  attachments?: Attachment[];
}

export interface OrgAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  edited?: boolean;
  expirationDate?: string;
  borderColor?: string;
  attachments?: Attachment[];
}

export interface LeaderboardEntry {
  _id: string;
  username: string;
  displayName: string;
  department: string;
  points: number;
  rank: number;
  avatar?: string;
}

export interface HomeContentProps {
  department: string;
}

export interface HRHeadHomeContentProps {
  department: string;
}