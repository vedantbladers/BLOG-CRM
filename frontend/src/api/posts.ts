import { apiClient } from "./client";
import type { Category, Post, PostRequest, Tag } from "../types/post";

export async function listPosts(): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/posts");
  return data;
}

export async function getPost(id: number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/posts/${id}`);
  return data;
}

export async function createPost(payload: PostRequest): Promise<Post> {
  const { data } = await apiClient.post<Post>("/posts", payload);
  return data;
}

export async function updatePost(id: number, payload: PostRequest): Promise<Post> {
  const { data } = await apiClient.patch<Post>(`/posts/${id}`, payload);
  return data;
}

export async function publishPost(id: number): Promise<Post> {
  const { data } = await apiClient.post<Post>(`/posts/${id}/publish`);
  return data;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", { name, slug });
  return data;
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<Tag[]>("/tags");
  return data;
}

export async function createTag(name: string, slug: string): Promise<Tag> {
  const { data } = await apiClient.post<Tag>("/tags", { name, slug });
  return data;
}
