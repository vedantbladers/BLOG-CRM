import { useState } from "react";
import type { Comment } from "../types/comment";
import { Button } from "./Button";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onSave: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CommentItem({ comment, isOwner, onSave, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      await onSave(comment.id, draft);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(comment.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="py-4 border-b border-ink-soft/10 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-ink">
          {comment.author.displayName || comment.author.username}
        </span>
        <span className="text-xs text-ink-soft">{formatDate(comment.createdAt)}</span>
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="w-full rounded-sm bg-paper-dim border border-ink-soft/20 px-3 py-2 text-sm text-ink
              focus:outline-none focus:border-brass mb-2"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              loading={busy}
              disabled={!draft.trim()}
              className="!w-auto px-3 py-1.5 text-xs"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(comment.content);
                setEditing(false);
              }}
              className="!w-auto px-3 py-1.5 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          {isOwner && (
            <div className="flex gap-3 mt-1.5">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-ink-soft hover:text-brass-dark underline underline-offset-2"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="text-xs text-ink-soft hover:text-error underline underline-offset-2 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
