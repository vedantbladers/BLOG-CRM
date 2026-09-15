import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PostCard } from "../components/PostCard";
import { listMyBookmarks } from "../api/bookmarks";
import { getErrorMessage } from "../api/client";
import type { Post } from "../types/post";

export function BookmarksPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyBookmarks()
      .then(setPosts)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <AppHeader eyebrow="Your bookmarks" />

        {error && <p className="text-sm text-error mb-6">{error}</p>}

        {posts === null && !error && <p className="text-paper/60 text-sm">Loading…</p>}

        {posts !== null && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-paper/70 mb-4">You haven't bookmarked anything yet.</p>
            <Link to="/" className="text-brass hover:text-brass-dark underline underline-offset-2">
              Browse the feed
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
