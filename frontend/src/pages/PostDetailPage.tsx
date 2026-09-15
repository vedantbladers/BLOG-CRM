import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getPost, publishPost } from "../api/posts";
import { getLikeStatus, likePost, unlikePost } from "../api/likes";
import { getBookmarkStatus, bookmarkPost, removeBookmark } from "../api/bookmarks";
import { followUser, getFollowStatus, unfollowUser } from "../api/follows";
import { createComment, deleteComment, listComments, updateComment } from "../api/comments";
import { getCurrentUser } from "../api/users";
import { getErrorMessage } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { CommentItem } from "../components/CommentItem";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";
import type { User } from "../types/auth";
import type { LikeStatus } from "../types/like";
import type { BookmarkStatus } from "../types/bookmark";
import type { FollowStatus } from "../types/follow";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [likeStatus, setLikeStatus] = useState<LikeStatus | null>(null);
  const [bookmarkStatus, setBookmarkStatus] = useState<BookmarkStatus | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeBusy, setLikeBusy] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPost, me] = await Promise.all([getPost(postId), getCurrentUser()]);
        if (cancelled) return;
        setPost(fetchedPost);
        setCurrentUser(me);

        if (fetchedPost.status === "PUBLISHED") {
          const isOwnPost = me.id === fetchedPost.author.id;
          const [status, bmStatus, commentList] = await Promise.all([
            getLikeStatus(postId),
            getBookmarkStatus(postId),
            listComments(postId),
          ]);
          if (cancelled) return;
          setLikeStatus(status);
          setBookmarkStatus(bmStatus);
          setComments(commentList);

          if (!isOwnPost) {
            const fStatus = await getFollowStatus(fetchedPost.author.id);
            if (!cancelled) setFollowStatus(fStatus);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!Number.isNaN(postId)) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleToggleLike() {
    if (!likeStatus) return;
    setLikeBusy(true);
    try {
      if (likeStatus.liked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      setLikeStatus(await getLikeStatus(postId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleToggleBookmark() {
    if (!bookmarkStatus) return;
    setBookmarkBusy(true);
    try {
      if (bookmarkStatus.bookmarked) {
        await removeBookmark(postId);
      } else {
        await bookmarkPost(postId);
      }
      setBookmarkStatus(await getBookmarkStatus(postId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBookmarkBusy(false);
    }
  }

  async function handleToggleFollow() {
    if (!post || !followStatus) return;
    setFollowBusy(true);
    try {
      if (followStatus.following) {
        await unfollowUser(post.author.id);
      } else {
        await followUser(post.author.id);
      }
      setFollowStatus(await getFollowStatus(post.author.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  }

  async function handlePublish() {
    setPublishBusy(true);
    try {
      const published = await publishPost(postId);
      setPost(published);
      const [status, bmStatus, commentList] = await Promise.all([
        getLikeStatus(postId),
        getBookmarkStatus(postId),
        listComments(postId),
      ]);
      setLikeStatus(status);
      setBookmarkStatus(bmStatus);
      setComments(commentList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishBusy(false);
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentBusy(true);
    try {
      const created = await createComment(postId, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleSaveComment(commentId: number, content: string) {
    const updated = await updateComment(commentId, content);
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/60 text-sm">Loading…</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <Link to="/" className="text-brass hover:text-brass-dark underline underline-offset-2">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isOwner = currentUser?.id === post.author.id;
  const isPublished = post.status === "PUBLISHED";

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <AppHeader />

        <article className="bg-paper rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-8 py-10 sm:px-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft mb-4">
            {!isPublished && (
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
            <span>·</span>
            <Link
              to={`/users/${post.author.id}`}
              className="hover:text-brass-dark underline underline-offset-2"
            >
              {post.author.displayName || post.author.username}
            </Link>
            {isPublished && !isOwner && followStatus && (
              <button
                onClick={handleToggleFollow}
                disabled={followBusy}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors disabled:opacity-50 ${
                  followStatus.following
                    ? "bg-brass border-brass text-paper"
                    : "border-ink-soft/30 hover:border-brass hover:text-brass-dark"
                }`}
              >
                {followStatus.following ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-ink mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="text-ink leading-relaxed whitespace-pre-wrap mb-6">
            {post.content || post.excerpt}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag.id} className="text-xs text-ink-soft/80">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3 mb-4">
              <Link
                to={`/posts/${post.id}/edit`}
                className="text-sm px-4 py-2 rounded-sm border border-ink-soft/30 text-ink-soft
                  hover:border-brass hover:text-brass-dark transition-colors"
              >
                Edit
              </Link>
              {!isPublished && (
                <Button onClick={handlePublish} loading={publishBusy} className="!w-auto px-4">
                  Publish now
                </Button>
              )}
            </div>
          )}

          {isPublished && likeStatus && bookmarkStatus && (
            <div className="pt-4 border-t border-ink-soft/10 flex gap-3">
              <button
                onClick={handleToggleLike}
                disabled={likeBusy}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                  likeStatus.liked
                    ? "bg-brass border-brass text-paper"
                    : "border-ink-soft/30 text-ink-soft hover:border-brass hover:text-brass-dark"
                }`}
              >
                {likeStatus.liked ? "♥ Liked" : "♡ Like"} · {likeStatus.count}
              </button>

              <button
                onClick={handleToggleBookmark}
                disabled={bookmarkBusy}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                  bookmarkStatus.bookmarked
                    ? "bg-brass border-brass text-paper"
                    : "border-ink-soft/30 text-ink-soft hover:border-brass hover:text-brass-dark"
                }`}
              >
                {bookmarkStatus.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
              </button>
            </div>
          )}
        </article>

        {isPublished && (
          <div className="bg-paper rounded-sm shadow-[0_12px_32px_rgba(0,0,0,0.25)] px-8 py-8 sm:px-12 mt-5">
            <h2 className="font-display text-xl text-ink mb-4">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
                rows={2}
                className="w-full rounded-sm bg-paper-dim border border-ink-soft/20 px-3.5 py-2.5 text-sm
                  text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-brass mb-2"
              />
              <Button
                type="submit"
                loading={commentBusy}
                disabled={!newComment.trim()}
                className="!w-auto px-4 text-sm"
              >
                Post comment
              </Button>
            </form>

            {error && <p className="text-sm text-error mb-4">{error}</p>}

            {comments.length === 0 ? (
              <p className="text-sm text-ink-soft">No comments yet.</p>
            ) : (
              <div>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isOwner={currentUser?.id === comment.author.id}
                    onSave={handleSaveComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
