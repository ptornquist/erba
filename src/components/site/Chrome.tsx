import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-gold/20 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
            Archive
          </span>
          <span className="font-serif text-xl text-paper group-hover:text-gold">
            Sport History Clue
          </span>
        </Link>
        <nav className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70">
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
