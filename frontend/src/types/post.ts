export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface PostRequest {
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  categoryId?: number;
  tagIds?: number[];
}

export interface PostAuthor {
  id: number;
  username: string;
  displayName?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  category?: Category;
  tags: Tag[];
  author: PostAuthor;
}
