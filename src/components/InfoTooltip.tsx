"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Tap / keyboard friendly tooltip — works on mobile where hover fails. */
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="More info"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold leading-none transition ${
          open
            ? "border-court text-court ring-2 ring-court/30"
            : "border-line bg-surface text-muted"
        }`}
      >
        ?
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-40 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-line bg-ink px-2.5 py-2 text-left text-[11px] font-normal normal-case tracking-normal text-white/90 shadow-lg"
        >
          {text}
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-ink" />
        </span>
      ) : null}
    </span>
  );
}
