export interface ICommentUser {
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
}

export interface IComment extends ICommentUser {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  projectId: string;
  projectTitle: string;
  parentCommentId?: string;
  isLikedByCurrentUser: boolean;
  replies?: IComment[];
}

export interface ICreateComment {
  content: string;
  projectId: string;
  parentCommentId?: string;
}
