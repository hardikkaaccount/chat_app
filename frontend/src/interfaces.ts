export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
}

export interface Message {
  id: number;
  group_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  username?: string;
}