"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LogOut, Menu, ShieldAlert, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { SocialLinks } from "@/components/social-links";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { hardNavigate } from "@/lib/navigation";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setIsAuthed(Boolean(data.user)));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleSignOut() {
    closeMenu();
    if (!isSupabaseConfigured) return;
    await createClient().auth.signOut();
    setIsAuthed(false);
    hardNavigate("/");
  }

  const navLinks = [
    { href: "/pain-index" as const, label: t("painIndex") },
    { href: "/playbook" as const, label: t("playbook") },
    { href: "/#why-now" as const, label: t("whyNow") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg">{SITE_NAME}</span>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground md:inline">
            {t("alliance")}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <SocialLinks className="hidden md:flex" />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <ButtonLink href="/dashboard" variant="outline" size="sm">
                  {t("dashboard")}
                </ButtonLink>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut />
                  {t("signOut")}
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="outline" size="sm">
                  {t("login")}
                </ButtonLink>
                <ButtonLink href="/join" size="sm">
                  {t("join")}
                </ButtonLink>
              </>
            )}
          </nav>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={t("menu")}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border/60 bg-background px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <ButtonLink href="/dashboard" variant="outline" onClick={closeMenu}>
                  {t("dashboard")}
                </ButtonLink>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut />
                  {t("signOut")}
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="outline" onClick={closeMenu}>
                  {t("login")}
                </ButtonLink>
                <ButtonLink href="/join" onClick={closeMenu}>
                  {t("join")}
                </ButtonLink>
              </>
            )}
            <SocialLinks className="pt-1" />
          </div>
        </nav>
      )}
    </header>
  );
}
