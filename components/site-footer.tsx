import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { SITE_DOMAIN, SITE_FULL_NAME, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5 font-bold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldAlert className="size-4" aria-hidden="true" />
            </span>
            <span>{SITE_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {SITE_FULL_NAME}. An independent coalition of mid-cap CEOs
            documenting the cumulative cost of EU regulation, one data point at
            a time.
          </p>
          <div className="space-y-2 pt-1">
            <p className="text-sm font-semibold text-foreground">Follow ERBA</p>
            <SocialLinks />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold">Platform</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/join" className="hover:text-foreground">
                  Join Free
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/pain-index" className="hover:text-foreground">
                  Pain Index
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-foreground">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/dashboard" prefetch={false} className="hover:text-foreground">
                  Member Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Campaigns</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  Farmer Protests
                </Link>
              </li>
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  Green Deal Squeeze
                </Link>
              </li>
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  Mercosur Threat
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Contact</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href={`mailto:press@${SITE_DOMAIN}`}
                  className="hover:text-foreground"
                >
                  press@{SITE_DOMAIN}
                </a>
              </li>
              <li>Brussels · Berlin · Paris</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE_FULL_NAME}. All rights reserved.
          </p>
          <p>Anonymous submissions are never attributed to a named company.</p>
        </div>
      </div>
    </footer>
  );
}
