"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PainSubmission, TurnoverBand } from "@/types/database";
import {
  COMPANY_STORAGE_KEY,
  INDUSTRIES,
  SCM_TOOL_REFERENCE,
  TURNOVER_BANDS,
  combinedScmCost,
  formatEuro,
  generateReferralCode,
  parseEuro,
  toPainSubmission,
} from "@/lib/scm";
import { getSupabase } from "@/lib/supabase";

const STEPS = [
  { id: 1, title: "Identity" },
  { id: 2, title: "Company" },
  { id: 3, title: "The Pain Index" },
] as const;

export function JoinWizard() {
  const router = useRouter();
  const [step, setStep] = useState<(typeof STEPS)[number]["id"]>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [referredBy, setReferredBy] = useState("");

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>(
    "Manufacturing",
  );
  const [turnoverBand, setTurnoverBand] =
    useState<TurnoverBand>("from_10m_to_50m");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [regulationName, setRegulationName] = useState("");
  const [description, setDescription] = useState("");
  const [internalCost, setInternalCost] = useState("");
  const [externalCost, setExternalCost] = useState("");

  const internalAdminCostEur = parseEuro(internalCost);
  const externalComplianceCostEur = parseEuro(externalCost);
  const estimatedCostEur = combinedScmCost(
    internalAdminCostEur,
    externalComplianceCostEur,
  );

  const canContinue = useMemo(() => {
    if (step === 1) {
      return email.includes("@");
    }
    if (step === 2) {
      return name.trim().length > 1;
    }
    return (
      regulationName.trim().length > 1 &&
      description.trim().length > 8 &&
      estimatedCostEur > 0
    );
  }, [description, email, estimatedCostEur, name, regulationName, step]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const referralCode = generateReferralCode();
    const submission: Omit<PainSubmission, "id" | "company_id"> = {
      regulation_name: regulationName.trim(),
      description: description.trim(),
      internal_admin_cost_eur: internalAdminCostEur,
      external_compliance_cost_eur: externalComplianceCostEur,
      estimated_cost_eur: estimatedCostEur,
      verification_status: "self_reported",
      scm_tool_reference: SCM_TOOL_REFERENCE,
    };

    try {
      const supabase = getSupabase();
      let companyId = crypto.randomUUID();

      if (supabase) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .insert({
            email: email.trim().toLowerCase(),
            referral_code: referralCode,
            referred_by: referredBy.trim() || null,
          })
          .select("id")
          .single();

        if (userError || !user) {
          throw new Error(userError?.message ?? "Unable to create user record.");
        }

        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({
            user_id: user.id,
            name: name.trim(),
            industry,
            turnover_band: turnoverBand,
            is_anonymous: isAnonymous,
          })
          .select("id")
          .single();

        if (companyError || !company) {
          throw new Error(
            companyError?.message ?? "Unable to create company record.",
          );
        }

        companyId = company.id;

        const { data: pain, error: painError } = await supabase
          .from("pain_submissions")
          .insert({
            company_id: company.id,
            regulation_name: submission.regulation_name,
            description: submission.description,
            internal_admin_cost_eur: submission.internal_admin_cost_eur,
            external_compliance_cost_eur:
              submission.external_compliance_cost_eur,
            estimated_cost_eur: submission.estimated_cost_eur,
            verification_status: "self_reported",
            scm_tool_reference: SCM_TOOL_REFERENCE,
          })
          .select("*")
          .single();

        if (painError || !pain) {
          throw new Error(
            painError?.message ?? "Unable to store SCM cost submission.",
          );
        }

        persistSession(companyId, name.trim(), [toPainSubmission(pain)]);
      } else {
        persistSession(companyId, name.trim(), [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            ...submission,
          },
        ]);
      }

      router.push("/dashboard");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Submission failed. Check schema, RLS policies, and environment variables.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-white/10 bg-[#121826] text-[#ece7dc] ring-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="font-heading text-2xl">
          SCM cost intake
        </CardTitle>
        <CardDescription className="text-white/60">
          Three-step contribution to the independent European regulatory cost
          ledger.
        </CardDescription>
        <ol className="mt-4 grid grid-cols-3 gap-2 text-[11px] tracking-[0.14em] uppercase">
          {STEPS.map((item) => (
            <li
              key={item.id}
              className={
                item.id === step
                  ? "border-b-2 border-[#c4b38a] pb-2 text-[#c4b38a]"
                  : "border-b border-white/15 pb-2 text-white/40"
              }
            >
              0{item.id} {item.title}
            </li>
          ))}
        </ol>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-2">
        {step === 1 ? (
          <div className="grid gap-4">
            <Field
              label="Work email"
              htmlFor="email"
              hint="Used only to associate your company record."
            >
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="finance@company.eu"
                className="h-10"
              />
            </Field>
            <Field
              label="Referral code (optional)"
              htmlFor="referredBy"
              hint="If another contributor invited you."
            >
              <Input
                id="referredBy"
                value={referredBy}
                onChange={(event) => setReferredBy(event.target.value)}
                placeholder="ERBA-XXXX"
                className="h-10"
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <Field label="Legal or trading name" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10"
              />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <select
                id="industry"
                value={industry}
                onChange={(event) =>
                  setIndustry(event.target.value as (typeof INDUSTRIES)[number])
                }
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {INDUSTRIES.map((item) => (
                  <option key={item} value={item} className="bg-[#121826]">
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turnover band" htmlFor="turnover">
              <select
                id="turnover"
                value={turnoverBand}
                onChange={(event) =>
                  setTurnoverBand(event.target.value as TurnoverBand)
                }
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {TURNOVER_BANDS.map((item) => (
                  <option key={item.value} value={item.value} className="bg-[#121826]">
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-start gap-3 text-sm text-white/75">
              <Checkbox
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
                className="mt-0.5"
              />
              Keep this company anonymous in public ledger views.
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5">
            <Field label="Regulation or obligation" htmlFor="regulation">
              <Input
                id="regulation"
                value={regulationName}
                onChange={(event) => setRegulationName(event.target.value)}
                placeholder="e.g. CSRD, REACH, EU ETS MRV"
                className="h-10"
              />
            </Field>
            <Field
              label="Activity description"
              htmlFor="description"
              hint="Describe the information obligation in Standard Cost Model terms."
            >
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Internal Administrative Costs (€/year)"
                htmlFor="internal"
                hint="In-house staff time, paperwork, internal reporting workflows"
              >
                <Input
                  id="internal"
                  inputMode="decimal"
                  value={internalCost}
                  onChange={(event) => setInternalCost(event.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </Field>
              <Field
                label="External Compliance Costs (€/year)"
                htmlFor="external"
                hint="External auditors, legal retainers, third-party consultants, dedicated compliance tooling"
              >
                <Input
                  id="external"
                  inputMode="decimal"
                  value={externalCost}
                  onChange={(event) => setExternalCost(event.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#c4b38a]/25 bg-[#c4b38a]/8 px-4 py-3">
              <span className="text-sm text-white/65">
                Combined SCM burden
              </span>
              <span className="font-heading text-2xl text-[#c4b38a]">
                {formatEuro(estimatedCostEur)}
              </span>
            </div>
            <div className="flex gap-3 rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/70">
              <Info className="mt-0.5 size-4 shrink-0 text-[#c4b38a]" />
              Data calculated according to EU Standard Cost Model (Tool #58)
              principles.
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-amber-300">{error}</p> : null}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1 || submitting}
            onClick={() => setStep((current) => (current === 1 ? 1 : ((current - 1) as 1 | 2 | 3)))}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() =>
                setStep((current) => (current + 1) as 1 | 2 | 3)
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!canContinue || submitting}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Recording…" : "Submit SCM Cost Data"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

function persistSession(
  companyId: string,
  companyName: string,
  submissions: PainSubmission[],
) {
  window.localStorage.setItem(COMPANY_STORAGE_KEY, companyId);
  window.localStorage.setItem(
    "erba.session",
    JSON.stringify({ companyId, companyName, submissions }),
  );
}
