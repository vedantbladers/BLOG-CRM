import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AppHeaderProps {
  /** Small label shown under the wordmark, e.g. "New draft". */
  eyebrow?: string;
}

export function AppHeader({ eyebrow }: AppHeaderProps) {
  const { logout } = useAuth();
  const location = useLocation();

  const onFeed = location.pathname === "/";
  const onCreate = location.pathname === "/posts/new";
  const onBookmarks = location.pathname === "/bookmarks";

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <Link to="/" className="font-display text-2xl text-paper">
          BlogSphere
        </Link>
        {eyebrow && <p className="mt-1 text-xs text-paper/50 tracking-wide">{eyebrow}</p>}
      </div>

      <nav className="flex items-center gap-4 text-sm">
        {!onFeed && (
          <Link to="/" className="text-paper/60 hover:text-paper underline underline-offset-2">
            Feed
          </Link>
        )}
        {!onBookmarks && (
          <Link
            to="/bookmarks"
            className="text-paper/60 hover:text-paper underline underline-offset-2"
          >
            Bookmarks
          </Link>
        )}
        {!onCreate && (
          <Link to="/posts/new" className="text-brass hover:text-brass-dark underline underline-offset-2">
            Write a post
          </Link>
        )}
        <button
          onClick={logout}
          className="text-paper/60 hover:text-paper underline underline-offset-2"
        >
          Sign out
        </button>
      </nav>
    </div>
  );
}
