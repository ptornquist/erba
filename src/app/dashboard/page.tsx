import { DashboardClient } from "@/components/dashboard-client";
import { SiteFrame } from "@/components/site-frame";

export default function DashboardPage() {
  return (
    <SiteFrame>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
        <p className="text-[11px] tracking-[0.28em] text-[#c4b38a]">
          CONTRIBUTOR WORKSPACE
        </p>
        <h1 className="font-heading mt-3 text-4xl text-[#f4efe4]">Dashboard</h1>
        <p className="mt-3 mb-10 max-w-2xl text-sm leading-7 text-white/55">
          Track how each Standard Cost Model submission moves through
          Self-Reported, Evidence Supplied, and ERBA Verified states.
        </p>
        <DashboardClient />
      </main>
    </SiteFrame>
  );
}
