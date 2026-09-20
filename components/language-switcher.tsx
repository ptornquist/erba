"use client";

import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { hardNavigate } from "@/lib/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === locale) return;
    const search = window.location.search;
    const nextPath = getPathname({ href: pathname, locale: next });
    hardNavigate(`${nextPath}${search}`);
  }

  return (
    <label className={className}>
      <span className="sr-only">{t("language")}</span>
      <select
        key={locale}
        defaultValue={locale}
        aria-label={t("language")}
        className="h-9 max-w-[10.5rem] truncate rounded-md border border-border bg-background px-2 text-sm text-foreground"
        onChange={(event) => switchTo(event.target.value as Locale)}
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
