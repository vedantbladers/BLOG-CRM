import { apiClient } from "./client";
import type { BookmarkStatus } from "../types/bookmark";
import type { Post } from "../types/post";

export async function getBookmarkStatus(postId: number): Promise<BookmarkStatus> {
  const { data } = await apiClient.get<BookmarkStatus>(`/bookmarks/post/${postId}/status`);
  return data;
}

export async function bookmarkPost(postId: number): Promise<void> {
  await apiClient.post(`/bookmarks/post/${postId}`);
}

export async function removeBookmark(postId: number): Promise<void> {
  await apiClient.delete(`/bookmarks/post/${postId}`);
}

export async function listMyBookmarks(): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/bookmarks/mine");
  return data;
}
