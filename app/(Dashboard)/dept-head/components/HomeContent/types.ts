// app/components/OrgAnnouncements/types.ts

export interface Comment {
  _id?: string;
  author: string;
  text: string;
  pinned?: boolean;
  createdAt: string;
}

export interface Attachment {
  _id?: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
}

export interface Announcement {
  _id: string;
  department: string;
  title: string;
  content: string;
  color: string;
  comments?: Comment[];
  attachments?: Attachment[];
  pinned?: boolean;
  urgent?: boolean;
  edited?: boolean;
  deactivated?: boolean;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeptHeadHomeContentProps {
  department: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatar?: string;
}