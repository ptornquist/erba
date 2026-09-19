"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  ClipboardCheck,
  FolderLock,
  LayoutDashboard,
  MessagesSquare,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href:
    | "/dashboard"
    | "/dashboard/policy"
    | "/dashboard/checklists"
    | "/dashboard/vault"
    | "/dashboard/forum"
    | "/playbook";
  labelKey: "overview" | "policy" | "checklists" | "vault" | "forum" | "playbook";
  shortKey:
    | "overview"
    | "policyShort"
    | "checklistsShort"
    | "vaultShort"
    | "forumShort"
    | "playbookShort";
  descKey:
    | "overviewDesc"
    | "policyDesc"
    | "checklistsDesc"
    | "vaultDesc"
    | "forumDesc"
    | "playbookDesc";
  icon: LucideIcon;
  exact?: boolean;
}

const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "overview",
    shortKey: "overview",
    descKey: "overviewDesc",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/playbook",
    labelKey: "playbook",
    shortKey: "playbookShort",
    descKey: "playbookDesc",
    icon: BookOpen,
    exact: true,
  },
  {
    href: "/dashboard/policy",
    labelKey: "policy",
    shortKey: "policyShort",
    descKey: "policyDesc",
    icon: Radar,
  },
  {
    href: "/dashboard/checklists",
    labelKey: "checklists",
    shortKey: "checklistsShort",
    descKey: "checklistsDesc",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/vault",
    labelKey: "vault",
    shortKey: "vaultShort",
    descKey: "vaultDesc",
    icon: FolderLock,
  },
  {
    href: "/dashboard/forum",
    labelKey: "forum",
    shortKey: "forumShort",
    descKey: "forumDesc",
    icon: MessagesSquare,
  },
];

export function isNavItemActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboardNav");

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.exact);
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
              <span className="block truncate font-medium">{t(item.labelKey)}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {t(item.descKey)}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboardNav");

  return (
    <nav
      aria-label="Dashboard"
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-border px-4 pb-3 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {DASHBOARD_NAV.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.exact);
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
            {t(item.shortKey)}
          </Link>
        );
      })}
    </nav>
  );
}
