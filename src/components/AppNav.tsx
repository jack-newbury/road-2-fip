"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-line lg:bg-surface/80 lg:backdrop-blur">
        <div className="px-5 pt-8 pb-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-court-deep">
            Road to FIP
          </Link>
          <p className="mt-1 text-xs text-muted">Northampton · UK · FIP</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-8">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm transition ${
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

      <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-0.5 overflow-x-auto border-t border-line bg-surface/95 px-1 py-2 backdrop-blur lg:hidden">
        {LINKS.filter((l) =>
          ["/", "/roadmap", "/kourtos", "/meal-prep", "/gym", "/body"].includes(
            l.href,
          ),
        ).map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`min-w-[3.5rem] flex-1 rounded-md px-1 py-2 text-center text-[10px] font-medium ${
                active ? "bg-court text-white" : "text-muted"
              }`}
            >
              {link.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
