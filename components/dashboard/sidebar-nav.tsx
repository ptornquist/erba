"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FolderLock,
  LayoutDashboard,
  MessagesSquare,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Overview",
    description: "War Room & referrals",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/policy",
    label: "Policy Dashboard",
    shortLabel: "Policy",
    description: "Regulatory intelligence feed",
    icon: Radar,
  },
  {
    href: "/dashboard/checklists",
    label: "Compliance Checklists",
    shortLabel: "Checklists",
    description: "Track obligations by industry",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/vault",
    label: "Document Vault",
    shortLabel: "Vault",
    description: "Certificates & evidence",
    icon: FolderLock,
  },
  {
    href: "/dashboard/forum",
    label: "Networking Hub",
    shortLabel: "Hub",
    description: "Member strategy exchange",
    icon: MessagesSquare,
  },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const active = isNavItemActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                active
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-border bg-background group-hover:border-muted-foreground/40",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal, scrollable variant rendered above the content on small screens. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-border px-4 pb-3 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {DASHBOARD_NAV.map((item) => {
        const active = isNavItemActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
