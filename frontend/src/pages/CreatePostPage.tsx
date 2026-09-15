import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PostForm } from "../components/PostForm";
import { createPost, publishPost } from "../api/posts";
import type { PostRequest } from "../types/post";

export function CreatePostPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: PostRequest, publishNow: boolean) {
    const post = await createPost(values);
    if (publishNow) {
      await publishPost(post.id);
    }
    navigate("/", { state: { postCreated: true, published: publishNow, title: post.title } });
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <AppHeader eyebrow="New draft" />
        <PostForm
          submitLabel="Save draft"
          showPublishToggle
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
}
