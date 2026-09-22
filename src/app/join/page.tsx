import { JoinWizard } from "@/components/join-wizard";
import { SiteFrame } from "@/components/site-frame";

export default function JoinPage() {
  return (
    <SiteFrame>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
        <p className="text-[11px] tracking-[0.28em] text-[#c4b38a]">
          STEPWISE CONTRIBUTION
        </p>
        <h1 className="font-heading mt-3 text-4xl text-[#f4efe4]">
          Submit Standard Cost Model data
        </h1>
        <p className="mt-3 mb-10 max-w-2xl text-sm leading-7 text-white/55">
          Report internal administrative labour and external compliance
          expenditure using the Commission&apos;s Tool #58 structure. New
          submissions enter the ledger as Self-Reported until evidence is
          supplied.
        </p>
        <JoinWizard />
      </main>
    </SiteFrame>
  );
}
