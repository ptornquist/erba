import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteFrame } from "@/components/site-frame";

export default function Home() {
  return (
    <SiteFrame>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-20">
        <p className="text-[11px] font-medium tracking-[0.32em] text-[#c4b38a]">
          EUROPEAN REGULATORY BURDEN ARCHIVE
        </p>
        <h1 className="font-heading mt-6 max-w-4xl text-5xl leading-[1.08] tracking-tight text-[#f4efe4] md:text-6xl">
          The Independent Ledger of European Regulatory Costs
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
          Nobody has calculated the cumulative financial toll of European
          regulation on mid-market industry. We are measuring it using the
          EU&apos;s own Standard Cost Model.
        </p>
        <div className="mt-10">
          <Link
            href="/join"
            className={buttonVariants({
              size: "lg",
              className:
                "h-11 rounded-md bg-[#c4b38a] px-5 text-[#16140f] hover:bg-[#d4c49a]",
            })}
          >
            Submit SCM Cost Data
          </Link>
        </div>

        <p className="mt-8 max-w-3xl border-l border-[#c4b38a]/40 pl-4 text-xs leading-6 tracking-wide text-white/45">
          Methodology grounded in EU Better Regulation Toolbox (Tool #58) &amp;
          OECD Compliance Assessment Framework.
        </p>

        <section className="mt-16 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2">
          <Metric
            label="Total Documented Burden"
            value="€4.2B"
          />
          <Metric
            label="Independently Verified / Evidence Supplied"
            value="€1.1B"
          />
        </section>
      </main>
    </SiteFrame>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121826] px-8 py-8">
      <p className="text-[11px] tracking-[0.22em] text-white/45 uppercase">
        {label}
      </p>
      <p className="font-heading mt-3 text-4xl text-[#c4b38a]">{value}</p>
    </div>
  );
}
