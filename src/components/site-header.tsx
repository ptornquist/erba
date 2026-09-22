import Link from "next/link";

const NAV = [
  { href: "/pain-index", label: "Pain Index" },
  { href: "/join", label: "Submit data" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0b1018]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-sm border border-[#c4b38a]/40 bg-[#c4b38a]/10 text-sm text-[#c4b38a]">
            §
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-medium tracking-[0.28em] text-[#c4b38a]">
              ERBA
            </span>
            <span className="mt-1 text-xs text-white/55">
              Independent Cost Ledger
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-white/70">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
