import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, id, ...textareaProps }: TextAreaProps) {
  const fieldId = id ?? textareaProps.name;

  return (
    <div className="mb-5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft mb-1.5">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`w-full rounded-sm bg-paper-dim border px-3.5 py-2.5 text-ink placeholder:text-ink-soft/50
          transition-colors focus:outline-none focus:border-brass focus:bg-paper resize-y
          ${error ? "border-error" : "border-ink-soft/20"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...textareaProps}
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
