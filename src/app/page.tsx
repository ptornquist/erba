import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { expeditions, getDailyPuzzle } from "@/lib/catalog";
import { MAX_CLUES, MIN_SCORE, PENALTY_PER_CLUE, STARTING_SCORE } from "@/lib/scoring";
import { cn, formatUtcDate, utcDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const dateKey = utcDateKey();
  const daily = getDailyPuzzle(dateKey);

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Badge variant="gold">The archive is open</Badge>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] text-paper sm:text-6xl">
            History doesn&apos;t repeat. It leaves clues.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-paper/70">
            A cropped plate. A redacted box score. A line of period copy. Name the
            subject and the year before extra clues spend the file.
          </p>
        </div>
        <Card className="border-gold/40 bg-card text-paper">
          <CardHeader>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              {formatUtcDate(dateKey)}
            </p>
            <CardTitle>Today&apos;s brief</CardTitle>
            <CardDescription className="text-paper/65">{daily.teaser}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/daily" className={cn(buttonVariants({ variant: "gold" }), "w-full")}>
              Open the daily file
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ModeCard
          kicker="Mode 01"
          title="Daily Brief"
          body="One plate, worldwide, reset at UTC midnight. Same clues, same scoring, a share line for the group chat."
          href="/daily"
          cta="Play today"
        />
        <ModeCard
          kicker="Mode 02"
          title="Expeditions"
          body="Time-travel campaigns through five eras, from marble Athens to Lusail. Chain the files. Keep the streak of a different kind."
          href="/expeditions"
          cta="Choose an era"
        />
      </section>

      <section>
        <h2 className="font-serif text-2xl text-paper">How a brief is scored</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <Rule
            title={`${STARTING_SCORE.toLocaleString("en-US")} opening`}
            body="Every file starts at ten thousand. Clue one is free."
          />
          <Rule
            title={`${MAX_CLUES} plates`}
            body={`Each extra clue costs ${PENALTY_PER_CLUE.toLocaleString("en-US")}. You can always go back.`}
          />
          <Rule
            title={`${MIN_SCORE.toLocaleString("en-US")} floor`}
            body="Year and subject must both match. A correct file never drops below a thousand."
          />
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-paper">Expedition map</h2>
          <Link href="/expeditions" className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
            All eras
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {expeditions.map((expedition) => (
            <Link
              key={expedition.slug}
              href={`/expeditions/${expedition.slug}`}
              className="rounded-xl border border-gold/20 bg-card p-4 transition hover:border-gold"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                {expedition.period}
              </p>
              <p className="mt-2 font-serif text-lg leading-tight text-paper">
                {expedition.title}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ModeCard({
  kicker,
  title,
  body,
  href,
  cta,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-gold/20 bg-card">
      <CardHeader>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{kicker}</p>
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href} className={cn(buttonVariants({ variant: "gold" }))}>
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-gold/15 bg-card/80 p-4">
      <p className="font-serif text-xl text-gold">{title}</p>
      <p className="mt-2 text-sm text-paper/65">{body}</p>
    </li>
  );
}
