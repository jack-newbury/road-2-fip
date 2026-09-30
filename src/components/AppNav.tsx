"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home", short: "Home" },
  { href: "/roadmap", label: "Roadmap", short: "Map" },
  { href: "/kourtos", label: "Kourtos", short: "Kourt" },
  { href: "/recaps", label: "AI coach", short: "AI" },
  { href: "/practice", label: "Practice", short: "Court" },
  { href: "/competitions", label: "Competitions", short: "Comp" },
  { href: "/coaching", label: "Coaching", short: "Coach" },
  { href: "/gym", label: "Gym", short: "Gym" },
  { href: "/body", label: "Body", short: "Body" },
  { href: "/recovery", label: "Recovery", short: "Rec" },
  { href: "/nutrition", label: "Nutrition", short: "Fuel" },
  { href: "/meal-prep", label: "Meal prep", short: "Meals" },
  { href: "/profile", label: "Profile", short: "You" },
] as const;

const MOBILE_PRIMARY = ["/", "/roadmap", "/meal-prep", "/gym"] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  const moreActive = !MOBILE_PRIMARY.some((href) => isActive(pathname, href));

  return (
    <>
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-surface/80 lg:backdrop-blur">
        <div className="px-5 pt-8 pb-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-court-deep"
          >
            Road to FIP
          </Link>
          <p className="mt-1 text-xs text-muted">Northampton · UK · FIP</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-8">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-court text-white"
                    : "text-ink hover:bg-clay-light/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile more sheet */}
      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl animate-fade-up">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
              <p className="font-display text-base font-semibold text-charcoal">
                Menu
              </p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted hover:text-charcoal"
              >
                Close
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2 p-4">
              {LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "border-court bg-court text-white"
                        : "border-line bg-background/50 text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      {/* Mobile bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-0.5 px-1 pt-1">
          {LINKS.filter((l) =>
            (MOBILE_PRIMARY as readonly string[]).includes(l.href),
          ).map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-md px-1 py-1.5 text-center text-[10px] font-medium ${
                  active ? "bg-court text-white" : "text-muted"
                }`}
              >
                {link.short}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-md px-1 py-1.5 text-center text-[10px] font-medium ${
              moreOpen || moreActive
                ? "bg-court text-white"
                : "text-muted"
            }`}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            More
          </button>
        </div>
      </nav>
    </>
  );
}
