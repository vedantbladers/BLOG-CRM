import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PaperShell } from "../components/PaperShell";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)?.justRegistered
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaperShell
      heading="Sign in"
      subheading="Pick up where you left off."
      footer={
        <span>
          New here?{" "}
          <Link to="/register" className="text-brass hover:text-brass-dark">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {justRegistered && (
          <p className="mb-5 text-sm text-success">
            Account created. Sign in to continue.
          </p>
        )}
        <TextField
          label="Username or email"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p role="alert" className="mb-5 text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </form>
    </PaperShell>
  );
}
