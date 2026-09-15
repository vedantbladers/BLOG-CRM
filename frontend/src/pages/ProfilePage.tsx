import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PostCard } from "../components/PostCard";
import { getCurrentUser, getUser } from "../api/users";
import { listPosts } from "../api/posts";
import { followUser, getFollowStatus, unfollowUser } from "../api/follows";
import { getErrorMessage } from "../api/client";
import type { User } from "../types/auth";
import type { Post } from "../types/post";
import type { FollowStatus } from "../types/follow";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profile, me, allPosts] = await Promise.all([
          getUser(userId),
          getCurrentUser(),
          listPosts(),
        ]);
        if (cancelled) return;

        setProfileUser(profile);
        setCurrentUser(me);

        const isOwn = me.id === profile.id;
        const theirPosts = allPosts
          .filter((p) => p.author.id === profile.id)
          .filter((p) => isOwn || p.status === "PUBLISHED")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(theirPosts);

        if (!isOwn) {
          const status = await getFollowStatus(profile.id);
          if (!cancelled) setFollowStatus(status);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!Number.isNaN(userId)) load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggleFollow() {
    if (!profileUser || !followStatus) return;
    setFollowBusy(true);
    try {
      if (followStatus.following) {
        await unfollowUser(profileUser.id);
      } else {
        await followUser(profileUser.id);
      }
      const refreshed = await getFollowStatus(profileUser.id);
      setFollowStatus(refreshed);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/60 text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-error">{error ?? "User not found."}</p>
      </div>
    );
  }

  const isOwn = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <AppHeader />

        <div className="bg-paper rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-8 py-8 sm:px-10 mb-8">
          <h1 className="font-display text-2xl text-ink mb-1">
            {profileUser.displayName || profileUser.username}
          </h1>
          <p className="text-sm text-ink-soft mb-3">@{profileUser.username}</p>
          {profileUser.bio && <p className="text-ink-soft leading-relaxed mb-4">{profileUser.bio}</p>}

          <div className="flex items-center gap-4">
            {followStatus && (
              <span className="text-sm text-ink-soft">
                {followStatus.followerCount} follower{followStatus.followerCount === 1 ? "" : "s"}
              </span>
            )}
            {!isOwn && followStatus && (
              <button
                onClick={handleToggleFollow}
                disabled={followBusy}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                  followStatus.following
                    ? "bg-brass border-brass text-paper"
                    : "border-ink-soft/30 text-ink-soft hover:border-brass hover:text-brass-dark"
                }`}
              >
                {followStatus.following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <h2 className="font-display text-lg text-paper mb-4">
          {isOwn ? "Your posts" : "Posts"}
        </h2>

        {posts.length === 0 ? (
          <p className="text-paper/60 text-sm">No posts yet.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
