import { apiClient } from "./client";
import type { Comment } from "../types/comment";

export async function listComments(postId: number): Promise<Comment[]> {
  const { data } = await apiClient.get<Comment[]>(`/comments/post/${postId}`);
  return data;
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>("/comments", { postId, content });
  return data;
}

export async function updateComment(id: number, content: string): Promise<Comment> {
  const { data } = await apiClient.patch<Comment>(`/comments/${id}`, { content });
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await apiClient.delete(`/comments/${id}`);
}
