export interface CommentAuthor {
  id: number;
  username: string;
  displayName?: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}
