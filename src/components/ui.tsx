import { ReactNode } from "react";

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      className="group/tip relative inline-flex align-middle outline-none"
      aria-label={text}
    >
      <span
        aria-hidden
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line bg-surface text-[10px] font-bold leading-none text-muted transition group-hover/tip:border-court/50 group-hover/tip:text-court group-focus/tip:border-court/50 group-focus/tip:text-court group-focus/tip:ring-2 group-focus/tip:ring-court/40"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 w-56 -translate-x-1/2 rounded-lg border border-line bg-ink px-2.5 py-2 text-left text-[11px] font-normal normal-case tracking-normal text-white/90 opacity-0 shadow-lg transition duration-150 group-hover/tip:opacity-100 group-focus/tip:opacity-100"
      >
        {text}
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-ink" />
      </span>
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
  tooltip,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  tooltip?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
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
