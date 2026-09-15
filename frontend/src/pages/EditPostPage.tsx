import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PostForm } from "../components/PostForm";
import { getPost, publishPost, updatePost } from "../api/posts";
import { getErrorMessage } from "../api/client";
import type { Post, PostRequest } from "../types/post";

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(postId)) return;
    getPost(postId)
      .then(setPost)
      .catch((err) => setError(getErrorMessage(err)));
  }, [postId]);

  async function handleSubmit(values: PostRequest, publishNow: boolean) {
    const updated = await updatePost(postId, values);
    if (publishNow) {
      await publishPost(postId);
    }
    navigate(`/posts/${postId}`, {
      state: { postUpdated: true, title: updated.title },
    });
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-paper/60 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <AppHeader eyebrow="Editing" />
        <PostForm
          initial={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            categoryId: post.category?.id,
            tagIds: post.tags.map((t) => t.id),
          }}
          submitLabel="Save changes"
          showPublishToggle={post.status !== "PUBLISHED"}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/posts/${postId}`)}
        />
      </div>
    </div>
  );
}
