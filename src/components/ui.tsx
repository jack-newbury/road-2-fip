import { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-charcoal outline-none ring-court/30 placeholder:text-muted/70 focus:ring-2";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input className={inputClass} {...props} />;
}

export function TextSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return <select className={inputClass} {...props} />;
}

export function TextTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea className={`${inputClass} min-h-[88px] resize-y`} {...props} />;
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-md bg-court px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-court-deep disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="text-xs font-medium text-muted underline-offset-2 hover:text-charcoal hover:underline"
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface/90 p-5 shadow-[0_1px_0_rgba(28,28,28,0.04)]">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h2 className="font-display text-lg font-semibold text-charcoal">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 animate-fade-up">
      <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
