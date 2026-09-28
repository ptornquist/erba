"use client";

import { useState, type SVGProps } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const LINKEDIN_SHARE_TEXT =
  "We just put our compliance costs on the independent ledger. It is time to objectively measure the true cost of European regulation on mid-market businesses. Make it count at euregburden.org #MakeItCount #ERBA";

const LINKEDIN_FEED_URL = "https://www.linkedin.com/feed/";

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

export function SocialShareCard() {
  const [copied, setCopied] = useState(false);

  async function copyAndShare() {
    try {
      await navigator.clipboard.writeText(LINKEDIN_SHARE_TEXT);
    } catch {
      const input = document.createElement("textarea");
      input.value = LINKEDIN_SHARE_TEXT;
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
    window.open(LINKEDIN_FEED_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-b from-primary/5 to-card">
      <CardHeader className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          LinkedIn growth loop
        </p>
        <CardTitle className="text-xl leading-snug">
          Take a stand. Share your participation.
        </CardTitle>
        <CardDescription>
          Copy this post, then paste it on LinkedIn so other CEOs can add their
          costs to the independent ledger.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote
          className="rounded-lg border border-primary/10 bg-secondary/70 p-4 text-sm leading-relaxed text-foreground"
          aria-label="Suggested LinkedIn post"
        >
          {LINKEDIN_SHARE_TEXT}
        </blockquote>
        <Button
          type="button"
          className="w-full"
          onClick={copyAndShare}
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check />
              Copied!
            </>
          ) : (
            <>
              <LinkedInIcon className="size-4" />
              Copy &amp; Share on LinkedIn
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
