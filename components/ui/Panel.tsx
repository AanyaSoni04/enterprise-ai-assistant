import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function Panel({ children, className = "", description, title }: PanelProps) {
  return (
    <section
      // Panels are the reusable building blocks for enterprise dashboard sections.
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {(title || description) && (
        <header className="mb-4 space-y-1">
          {title && <h2 className="text-base font-semibold text-slate-950">{title}</h2>}
          {description && <p className="text-sm leading-6 text-slate-500">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

