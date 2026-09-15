import { Link } from "react-router-dom";
import type { Post } from "../types/post";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-paper rounded-sm shadow-[0_12px_32px_rgba(0,0,0,0.25)] px-7 py-6 sm:px-8 sm:py-7">
      <div className="flex items-center gap-2 text-xs text-ink-soft mb-3">
        {post.status !== "PUBLISHED" && (
          <span className="px-2 py-0.5 rounded-full border border-error/40 text-error">
            {post.status}
          </span>
        )}
        {post.category && (
          <span className="px-2 py-0.5 rounded-full border border-brass/40 text-brass-dark">
            {post.category.name}
          </span>
        )}
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <h2 className="font-display text-2xl text-ink mb-2 leading-snug">
        <Link to={`/posts/${post.id}`} className="hover:text-brass-dark transition-colors">
          {post.title}
        </Link>
      </h2>
      <p className="text-ink-soft leading-relaxed mb-4">{post.excerpt}</p>

      <div className="flex items-center justify-between">
        <Link
          to={`/users/${post.author.id}`}
          className="text-xs text-ink-soft hover:text-brass-dark underline underline-offset-2"
        >
          {post.author.displayName || post.author.username}
        </Link>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag.id} className="text-xs text-ink-soft/80">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
