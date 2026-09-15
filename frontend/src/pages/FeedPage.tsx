import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { listPosts } from "../api/posts";
import { getErrorMessage } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { PostCard } from "../components/PostCard";
import type { Post } from "../types/post";

interface PostCreatedState {
  postCreated?: boolean;
  published?: boolean;
  title?: string;
}

export function FeedPage() {
  const location = useLocation();
  const state = (location.state as PostCreatedState | null) ?? {};

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPosts()
      .then((all) => {
        const published = all
          .filter((p) => p.status === "PUBLISHED")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(published);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <AppHeader />

        {state.postCreated && (
          <p className="mb-6 text-sm text-success">
            "{state.title}" was {state.published ? "published" : "saved as a draft"}.
          </p>
        )}

        {error && <p className="text-sm text-error mb-6">{error}</p>}

        {posts === null && !error && (
          <p className="text-paper/60 text-sm">Loading posts…</p>
        )}

        {posts !== null && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-paper/70 mb-4">No published posts yet.</p>
            <Link to="/posts/new" className="text-brass hover:text-brass-dark underline underline-offset-2">
              Be the first to write one
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
