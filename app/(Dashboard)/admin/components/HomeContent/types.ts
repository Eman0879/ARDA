// app/(Dashboard)/hr-head/components/HomeContent/types.ts

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
}

export interface Comment {
  _id?: string;
  author: string;
  text: string;
  createdAt: string;
  pinned?: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  color: string;
  comments: Comment[];
  attachments?: Attachment[];
  pinned?: boolean;
  urgent?: boolean;
  edited?: boolean;
  createdAt: string;
  updatedAt?: string;
  department?: string;
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

export interface HRHeadHomeContentProps {
  department: string;
}