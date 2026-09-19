"use client";

import { useState } from "react";
import { Check, Copy, Lock, Share2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { REFERRALS_TO_UNLOCK, SITE_DOMAIN } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReferralTrackerProps {
  referralCode: string;
  referralCount: number;
}

export function ReferralTracker({
  referralCode,
  referralCount,
}: ReferralTrackerProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${SITE_DOMAIN}/join?ref=${referralCode}`;
  const shareUrl = `https://${referralLink}`;
  const clamped = Math.min(referralCount, REFERRALS_TO_UNLOCK);
  const percent = (clamped / REFERRALS_TO_UNLOCK) * 100;
  const unlocked = referralCount >= REFERRALS_TO_UNLOCK;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Clipboard API unavailable (insecure context / permissions): fall back.
      const input = document.createElement("textarea");
      input.value = shareUrl;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    const shareData = {
      title: "Join the European Regulatory Burden Alliance",
      text: "Europe's real economy has had enough. Join ERBA as a company or a private individual — adding a Pain Index figure is optional.",
      url: shareUrl,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed the share sheet; fall through to copy.
      }
    }
    await copyLink();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" aria-hidden="true" />
            Referral Tracker
          </CardTitle>
          {unlocked ? (
            <Badge variant="success">Full Membership unlocked</Badge>
          ) : (
            <Badge variant="secondary">
              <Lock className="size-3" aria-hidden="true" />
              Full Membership locked
            </Badge>
          )}
        </div>
        <CardDescription>
          Recruit {REFERRALS_TO_UNLOCK} fellow CEOs to unlock Full Membership:
          MEP briefing calls, the quarterly burden report, and a seat in the
          Brussels delegation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">
              {clamped}/{REFERRALS_TO_UNLOCK} Referrals to unlock Full
              Membership
            </span>
            <span className="font-mono text-muted-foreground">
              {Math.round(percent)}%
            </span>
          </div>
          <Progress
            value={percent}
            aria-label={`${clamped} of ${REFERRALS_TO_UNLOCK} referrals completed`}
            indicatorClassName={cn(unlocked && "bg-primary")}
          />
          <div className="flex justify-between">
            {Array.from({ length: REFERRALS_TO_UNLOCK }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[10px] font-bold",
                  i < clamped
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {i < clamped ? <Check className="size-3" /> : i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Your personal invite link</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex h-11 flex-1 items-center overflow-hidden rounded-md border border-input bg-background px-3 font-mono text-sm">
              <span className="truncate">{referralLink}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyLink}
                variant={copied ? "secondary" : "default"}
                className="h-11 flex-1 sm:flex-none"
              >
                {copied ? (
                  <>
                    <Check />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={share}
                variant="outline"
                className="h-11"
                aria-label="Share invite link"
              >
                <Share2 />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Referral code:{" "}
            <span className="font-mono font-semibold text-foreground">
              {referralCode}
            </span>
            . Anyone who joins through this link counts toward your unlock.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
