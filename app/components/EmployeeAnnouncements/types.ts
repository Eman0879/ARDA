// app/(Dashboard)/employee/components/HomeContent/types.ts

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
  createdAt: string;
  comments?: Comment[];
  pinned?: boolean;
  urgent?: boolean;
  edited?: boolean;
}

export interface LeaderboardEntry {
  _id: string;
  employeeId: string;
  displayName: string;
  employeeNumber: string;
  points: number;
  rank?: number;
}

export interface HomeContentProps {
  department: string;
}