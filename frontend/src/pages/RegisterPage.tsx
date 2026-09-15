import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PaperShell } from "../components/PaperShell";
import { TextField } from "../components/TextField";
import { OtpInput } from "../components/OtpInput";
import { Button } from "../components/Button";
import { registerInitiate, registerResendOtp, registerVerify } from "../api/auth";
import { getErrorMessage } from "../api/client";

const RESEND_COOLDOWN_SECONDS = 60;

type Step = "details" | "verify";

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerInitiate({ username, email, password, displayName: displayName || undefined });
      setStep("verify");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerVerify({ email, otp });
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await registerResendOtp({ email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (step === "verify") {
    return (
      <PaperShell
        heading="Check your inbox"
        subheading={`We sent a 6-digit code to ${email}.`}
        footer={
          <span>
            Wrong email?{" "}
            <button
              onClick={() => setStep("details")}
              className="text-brass hover:text-brass-dark underline underline-offset-2"
            >
              Start over
            </button>
          </span>
        }
      >
        <div className="mb-5 text-xs text-ink-soft tracking-wide">Page 2 of 2 — Verify</div>

        <form onSubmit={handleVerifySubmit} noValidate>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          {error && (
            <p role="alert" className="mb-5 text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} disabled={otp.length !== 6}>
            Verify and create account
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full mt-3 text-sm text-ink-soft hover:text-brass-dark disabled:hover:text-ink-soft disabled:opacity-60 transition-colors"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      </PaperShell>
    );
  }

  return (
    <PaperShell
      heading="Start writing"
      subheading="Create your account to publish on BlogSphere."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="text-brass hover:text-brass-dark">
            Sign in
          </Link>
        </span>
      }
    >
      <div className="mb-5 text-xs text-ink-soft tracking-wide">Page 1 of 2 — Your details</div>

      <form onSubmit={handleDetailsSubmit} noValidate>
        <TextField
          label="Display name"
          name="displayName"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          hint="At least 8 characters."
          required
        />

        {error && (
          <p role="alert" className="mb-5 text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Send verification code
        </Button>
      </form>
    </PaperShell>
  );
}
