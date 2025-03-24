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

export interface CommentInterface {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  projectId: string;
  parentCommentId?: string;
  replies?: Comment[];
}

export interface CreateCommentInterface {
  content: string;
  projectId: string;
  parentCommentId?: string;
}
