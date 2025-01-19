export interface IComment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  timestamp: string;
  content: string;
  likes: number;
  replies: number;
}
