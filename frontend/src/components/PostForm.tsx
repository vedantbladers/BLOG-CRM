import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { TextArea } from "./TextArea";
import { Button } from "./Button";
import { getErrorMessage } from "../api/client";
import { createCategory, createTag, listCategories, listTags } from "../api/posts";
import type { Category, PostRequest, Tag } from "../types/post";
import { slugify } from "../utils/slugify";

export interface PostFormInitial {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number;
  tagIds?: number[];
}

interface PostFormProps {
  initial?: PostFormInitial;
  submitLabel: string;
  showPublishToggle: boolean;
  onSubmit: (values: PostRequest, publishNow: boolean) => Promise<void>;
  onCancel: () => void;
}

export function PostForm({ initial, submitLabel, showPublishToggle, onSubmit, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initial?.tagIds ?? []);
  const [newTagName, setNewTagName] = useState("");

  const [publishNow, setPublishNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
    listTags().then(setTags).catch(() => setTags([]));
  }, []);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  function toggleTag(id: number) {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let resolvedCategoryId: number | undefined = categoryId === "" ? undefined : categoryId;
      if (!resolvedCategoryId && newCategoryName.trim()) {
        const created = await createCategory(newCategoryName.trim(), slugify(newCategoryName));
        resolvedCategoryId = created.id;
      }

      const tagIds = [...selectedTagIds];
      if (newTagName.trim()) {
        const created = await createTag(newTagName.trim(), slugify(newTagName));
        tagIds.push(created.id);
      }

      await onSubmit(
        {
          title,
          slug,
          excerpt,
          content: content || undefined,
          categoryId: resolvedCategoryId,
          tagIds: tagIds.length ? tagIds : undefined,
        },
        publishNow
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-8 py-10 sm:px-12">
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title"
          required
          className="w-full font-display text-3xl sm:text-4xl text-ink placeholder:text-ink-soft/40
            bg-transparent border-0 border-b border-transparent focus:border-brass
            focus:outline-none pb-2 mb-1"
        />
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <span>/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            required
            className="flex-1 bg-transparent border-0 focus:outline-none focus:text-ink"
          />
        </div>

        <TextArea
          label="Excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          hint="A short summary shown in the feed."
          required
        />

        <TextArea
          label="Content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
        />

        <div className="mb-5">
          <label className="block text-sm text-ink-soft mb-1.5">Category</label>
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              className="flex-1 rounded-sm bg-paper-dim border border-ink-soft/20 px-3.5 py-2.5
                text-ink focus:outline-none focus:border-brass"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Or create a new category"
            disabled={categoryId !== ""}
            className="mt-2 w-full rounded-sm bg-paper-dim border border-ink-soft/20 px-3.5 py-2 text-sm
              text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-brass
              disabled:opacity-50"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm text-ink-soft mb-1.5">Tags</label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((t) => {
                const selected = selectedTagIds.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selected
                        ? "bg-brass border-brass text-paper"
                        : "border-ink-soft/30 text-ink-soft hover:border-brass hover:text-brass-dark"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          )}
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add a new tag"
            className="w-full rounded-sm bg-paper-dim border border-ink-soft/20 px-3.5 py-2 text-sm
              text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-brass"
          />
        </div>

        {showPublishToggle && (
          <label className="flex items-center gap-2 mb-6 text-sm text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="accent-brass"
            />
            Publish immediately
          </label>
        )}

        {error && (
          <p role="alert" className="mb-5 text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            {showPublishToggle && publishNow ? "Publish" : submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
