import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { InfoTooltip } from "@/components/InfoTooltip";

export { InfoTooltip };

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
    <label className="block min-w-0 space-y-1.5">
      <span className="inline-flex max-w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="truncate">{label}</span>
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

/** text-base (≥16px) avoids iOS zoom-on-focus */
const inputClass =
  "w-full min-w-0 rounded-md border border-line bg-surface px-3 py-3 text-base text-charcoal outline-none ring-court/30 placeholder:text-muted/70 focus:ring-2 sm:py-2.5 sm:text-sm";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function TextSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}

export function TextTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea className={`${inputClass} min-h-[88px] resize-y`} {...props} />
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-md bg-court px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-court-deep disabled:opacity-50 sm:w-auto ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="min-h-9 shrink-0 px-1 text-xs font-medium text-muted underline-offset-2 hover:text-charcoal hover:underline"
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
    <section className="rounded-xl border border-line bg-surface/90 p-4 shadow-[0_1px_0_rgba(28,28,28,0.04)] sm:p-5">
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
          {title ? (
            <h2 className="min-w-0 font-display text-base font-semibold text-charcoal sm:text-lg">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action ? <div className="shrink-0">{action}</div> : null}
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
    <header className="mb-6 animate-fade-up sm:mb-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-charcoal sm:text-3xl md:text-4xl">
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
