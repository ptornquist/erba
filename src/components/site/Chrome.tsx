import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-gold/20 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group flex min-w-0 items-baseline gap-2 sm:gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-gold sm:inline">
            Archive
          </span>
          <span className="truncate font-serif text-lg text-paper group-hover:text-gold sm:text-xl">
            Sport History Clue
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/70 sm:gap-4 sm:text-[11px] sm:tracking-[0.18em]">
          <Link href="/daily" className="hover:text-gold">
            Daily
          </Link>
          <Link href="/expeditions" className="hover:text-gold">
            Expeditions
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gold/15 py-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-paper/40">
      History doesn&apos;t repeat. It leaves clues.
    </footer>
  );
}
