import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PostCreatedState {
  postCreated?: boolean;
  published?: boolean;
  title?: string;
}

export function DashboardPage() {
  const { logout } = useAuth();
  const location = useLocation();
  const state = (location.state as PostCreatedState | null) ?? {};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {state.postCreated && (
          <p className="mb-6 text-sm text-success">
            "{state.title}" was {state.published ? "published" : "saved as a draft"}.
          </p>
        )}
        <p className="font-display text-2xl text-paper mb-2">You're signed in.</p>
        <p className="text-paper/60 mb-6 text-sm">The feed isn't built yet — this is a placeholder.</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link to="/posts/new" className="text-brass hover:text-brass-dark underline underline-offset-2">
            Write a post
          </Link>
          <button
            onClick={logout}
            className="text-brass hover:text-brass-dark underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
