"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className={className}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        className="h-9 max-w-[10.5rem] truncate rounded-md border border-border bg-background px-2 text-sm text-foreground"
        onChange={(event) => {
          const next = event.target.value as Locale;
          router.replace(pathname, { locale: next });
        }}
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
