import { apiClient } from "./client";
import type { FollowStatus } from "../types/follow";

export async function getFollowStatus(userId: number): Promise<FollowStatus> {
  const { data } = await apiClient.get<FollowStatus>(`/follows/user/${userId}/status`);
  return data;
}

export async function followUser(userId: number): Promise<void> {
  await apiClient.post(`/follows/user/${userId}`);
}

export async function unfollowUser(userId: number): Promise<void> {
  await apiClient.delete(`/follows/user/${userId}`);
}
