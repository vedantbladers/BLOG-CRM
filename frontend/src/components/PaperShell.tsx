import type { ReactNode } from "react";

interface PaperShellProps {
  heading: string;
  subheading?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function PaperShell({ heading, subheading, children, footer }: PaperShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-display text-3xl text-paper tracking-tight">
            BlogSphere
          </span>
        </div>

        <div className="bg-paper rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-8 py-10 sm:px-10">
          <div className="mb-8">
            <h1 className="font-display text-2xl text-ink mb-1">{heading}</h1>
            {subheading && (
              <p className="text-sm text-ink-soft leading-relaxed">{subheading}</p>
            )}
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-paper/70">{footer}</div>}
      </div>
    </div>
  );
}
