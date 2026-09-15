import { apiClient } from "./client";
import type { LikeStatus } from "../types/like";

export async function getLikeStatus(postId: number): Promise<LikeStatus> {
  const { data } = await apiClient.get<LikeStatus>(`/likes/post/${postId}/status`);
  return data;
}

export async function likePost(postId: number): Promise<void> {
  await apiClient.post(`/likes/post/${postId}`);
}

export async function unlikePost(postId: number): Promise<void> {
  await apiClient.delete(`/likes/post/${postId}`);
}
