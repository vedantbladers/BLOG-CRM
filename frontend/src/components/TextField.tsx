import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, id, ...inputProps }: TextFieldProps) {
  const fieldId = id ?? inputProps.name;

  return (
    <div className="mb-5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft mb-1.5">
        {label}
      </label>
      <input
        id={fieldId}
        className={`w-full rounded-sm bg-paper-dim border px-3.5 py-2.5 text-ink placeholder:text-ink-soft/50
          transition-colors focus:outline-none focus:border-brass focus:bg-paper
          ${error ? "border-error" : "border-ink-soft/20"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}
