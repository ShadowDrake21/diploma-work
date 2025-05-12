export interface IComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  userId: number;
  userName: string;
  userAvatarUrl: string;
  projectId: string;
  parentCommentId?: string;
  isLikedByCurrentUser: boolean;
  replies?: IComment[];
}

export interface ICreateComment {
  content: string;
  projectId: string;
  parentCommentId?: string;
}
